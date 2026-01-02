import { command, form, query } from '$app/server'
import { db } from '$lib/server/db'
import { payment, paymentsToTags, tag } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import { getLoggedInUser } from './(auth)/auth.remote'
import * as v from 'valibot'

export const getPayments = query(async () => {
	const user = await getLoggedInUser()

	const payments = await db.query.payment.findMany({
		where: eq(payment.userId, user.id),
		with: {
			paymentsToTags: {
				with: {
					tag: true
				}
			}
		}
	})

	return payments.map((p) => ({
		id: p.id,
		amount: p.amount,
		note: p.note,
		createdAt: p.createdAt,
		tags: p.paymentsToTags.map((ptt) => ({ id: ptt.tag.id, name: ptt.tag.name }))
	}))
})

const paymentsSchema = v.object({
	payments: v.array(
		v.object({
			amount: v.pipe(v.number(), v.minValue(0)),
			note: v.string(),
			tags: v.array(v.number()),
			date: v.date()
		})
	)
})

export const createPayments = command(paymentsSchema, async ({ payments }) => {
	const user = await getLoggedInUser()

	console.log({ payments })

	await db.transaction(async (tx) => {
		const insertedPayments = await tx
			.insert(payment)
			.values(
				payments.map((p) => ({
					amount: p.amount,
					note: p.note,
					createdAt: p.date,
					userId: user.id
				}))
			)
			.returning({ id: payment.id })

		const paymentTagRelations = payments.flatMap((p, index) =>
			(p.tags || []).map((tagId) => ({
				paymentId: insertedPayments[index].id,
				tagId: tagId
			}))
		)

		if (paymentTagRelations.length > 0) {
			await tx.insert(paymentsToTags).values(paymentTagRelations)
		}
	})
})

export const getTags = query(async () => {
	const user = await getLoggedInUser()

	return db.select().from(tag).where(eq(tag.userId, user.id))
})

export const createTag = form(
	v.object({
		name: v.string()
	}),
	async ({ name }) => {
		const user = await getLoggedInUser()
		await db.insert(tag).values({ name, userId: user.id })
	}
)
