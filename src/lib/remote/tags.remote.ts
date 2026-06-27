import { command, form, query } from '$app/server'
import { db } from '$lib/server/db'
import { tag, paymentsToTags, recurringPaymentsToTags } from '$lib/server/db/schema'
import { and, eq, inArray, ne } from 'drizzle-orm'
import { getLoggedInUser } from './auth.remote'
import { getPayments, getPaymentsMeta } from './payments.remote'
import { tagUpsertSchema } from '$lib/schemas'
import { DEFAULT_TAG_COLOR, DEFAULT_TAG_ICON } from '$lib/tag-meta'
import * as v from 'valibot'
import { invalid } from '@sveltejs/kit'

export const getTags = query(async () => {
	const user = await getLoggedInUser()

	return db.select().from(tag).where(eq(tag.userId, user.id)).orderBy(tag.name)
})

export const createOrUpdateTag = form(tagUpsertSchema, async (data, issue) => {
	const user = await getLoggedInUser()

	const id = data.id.trim() === '' ? null : Number(data.id)
	const budget = data.budget.trim() === '' ? null : Math.max(Math.round(Number(data.budget)), 0)
	const { name, color, icon } = data

	const nameClashes = await db
		.select({ id: tag.id })
		.from(tag)
		.where(and(eq(tag.userId, user.id), eq(tag.name, name), id == null ? undefined : ne(tag.id, id)))
	if (nameClashes.length > 0) {
		invalid(issue.name(`You already have a tag called “${name}”.`))
	}

	if (id == null) {
		await db.insert(tag).values({ name, color, icon, budget, userId: user.id })
	} else {
		await db
			.update(tag)
			.set({ name, color, icon, budget })
			.where(and(eq(tag.id, id), eq(tag.userId, user.id)))
	}

	getTags().refresh()
	return { ok: true as const }
})

const quickCreateTagSchema = v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(255))

export const quickCreateTag = command(quickCreateTagSchema, async (name) => {
	const user = await getLoggedInUser()

	const [existing] = await db
		.select()
		.from(tag)
		.where(and(eq(tag.userId, user.id), eq(tag.name, name)))
	if (existing) return existing

	const [created] = await db
		.insert(tag)
		.values({ name, color: DEFAULT_TAG_COLOR, icon: DEFAULT_TAG_ICON, userId: user.id })
		.returning()

	getTags().refresh()
	return created
})

const mergeTagsSchema = v.object({ sourceId: v.number(), targetId: v.number() })

// Fold `sourceId` into `targetId`: move every payment / recurring link from the
// source tag onto the target, then delete the source. The target keeps its own
// color, icon and budget.
export const mergeTags = command(mergeTagsSchema, async ({ sourceId, targetId }) => {
	const user = await getLoggedInUser()
	if (sourceId === targetId) return

	// Both tags must belong to the caller before we touch anything.
	const owned = await db
		.select({ id: tag.id })
		.from(tag)
		.where(and(eq(tag.userId, user.id), inArray(tag.id, [sourceId, targetId])))
	if (owned.length !== 2) return

	await db.transaction(async (tx) => {
		// Drop source links whose payment already carries the target tag — re-pointing
		// them would collide on the (paymentId, tagId) primary key — then move the rest.
		await tx.delete(paymentsToTags).where(
			and(
				eq(paymentsToTags.tagId, sourceId),
				inArray(
					paymentsToTags.paymentId,
					tx.select({ id: paymentsToTags.paymentId }).from(paymentsToTags).where(eq(paymentsToTags.tagId, targetId))
				)
			)
		)
		await tx.update(paymentsToTags).set({ tagId: targetId }).where(eq(paymentsToTags.tagId, sourceId))

		// Same dedup-then-move for recurring-rule links.
		await tx.delete(recurringPaymentsToTags).where(
			and(
				eq(recurringPaymentsToTags.tagId, sourceId),
				inArray(
					recurringPaymentsToTags.recurringPaymentId,
					tx
						.select({ id: recurringPaymentsToTags.recurringPaymentId })
						.from(recurringPaymentsToTags)
						.where(eq(recurringPaymentsToTags.tagId, targetId))
				)
			)
		)
		await tx
			.update(recurringPaymentsToTags)
			.set({ tagId: targetId })
			.where(eq(recurringPaymentsToTags.tagId, sourceId))

		await tx.delete(tag).where(and(eq(tag.id, sourceId), eq(tag.userId, user.id)))
	})

	getTags().refresh()
	getPayments().refresh()
	getPaymentsMeta().refresh()
})

export const deleteTag = command(v.number(), async (id) => {
	const user = await getLoggedInUser()
	const owned = await db
		.select({ id: tag.id })
		.from(tag)
		.where(and(eq(tag.id, id), eq(tag.userId, user.id)))
	if (owned.length === 0) return

	await db.delete(paymentsToTags).where(eq(paymentsToTags.tagId, id))
	await db.delete(recurringPaymentsToTags).where(eq(recurringPaymentsToTags.tagId, id))
	await db.delete(tag).where(eq(tag.id, id))
	getTags().refresh()
})
