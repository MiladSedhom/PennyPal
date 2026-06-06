import { command, query } from '$app/server'
import { db } from '$lib/server/db'
import { tag, paymentsToTags } from '$lib/server/db/schema'
import { and, eq } from 'drizzle-orm'
import { getLoggedInUser } from './auth.remote'
import * as v from 'valibot'

export const getTags = query(async () => {
	const user = await getLoggedInUser()

	return db.select().from(tag).where(eq(tag.userId, user.id)).orderBy(tag.name)
})

const tagInput = v.object({
	name: v.pipe(v.string(), v.trim(), v.minLength(1)),
	color: v.string(),
	icon: v.string(),
	// Optional per-tag monthly budget in whole dollars; null clears it.
	budget: v.nullable(v.pipe(v.number(), v.minValue(0)))
})

export const createTag = command(tagInput, async ({ name, color, icon, budget }) => {
	const user = await getLoggedInUser()
	await db.insert(tag).values({ name, color, icon, budget, userId: user.id })
	await getTags().refresh()
})

export const updateTag = command(
	v.object({ ...tagInput.entries, id: v.number() }),
	async ({ id, name, color, icon, budget }) => {
		const user = await getLoggedInUser()
		await db
			.update(tag)
			.set({ name, color, icon, budget })
			.where(and(eq(tag.id, id), eq(tag.userId, user.id)))
		await getTags().refresh()
	}
)

export const deleteTag = command(v.number(), async (id) => {
	const user = await getLoggedInUser()
	const owned = await db
		.select({ id: tag.id })
		.from(tag)
		.where(and(eq(tag.id, id), eq(tag.userId, user.id)))
	if (owned.length === 0) return

	await db.delete(paymentsToTags).where(eq(paymentsToTags.tagId, id))
	await db.delete(tag).where(eq(tag.id, id))
	await getTags().refresh()
})
