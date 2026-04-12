import { db } from '../index'
import { payment as paymentTable, paymentsToTags } from '../schema'
import { eq, desc } from 'drizzle-orm'

export async function getPayment(paymentId: number) {
	return await db.query.payment.findFirst({
		where: eq(paymentTable.id, paymentId),
		with: {
			user: true,
			paymentsToTags: {
				with: {
					tag: true
				}
			}
		}
	})
}

export async function getPaymentsByUser(userId: string) {
	return await db.query.payment.findMany({
		where: eq(paymentTable.userId, userId),
		orderBy: desc(paymentTable.createdAt),
		with: {
			paymentsToTags: {
				with: {
					tag: true
				}
			}
		}
	})
}

export async function getAllPayments() {
	return await db.query.payment.findMany({
		orderBy: desc(paymentTable.createdAt),
		with: {
			user: true,
			paymentsToTags: {
				with: {
					tag: true
				}
			}
		}
	})
}

export async function createPayment(data: {
	amount: number
	note?: string
	userId: string
	tagIds?: number[]
}) {
	const { tagIds, ...paymentData } = data
	const [payment] = await db.insert(paymentTable).values(paymentData).returning()

	if (tagIds && tagIds.length > 0) {
		await db.insert(paymentsToTags).values(
			tagIds.map((tagId) => ({
				paymentId: payment.id,
				tagId
			}))
		)
	}

	return payment
}

export async function updatePayment(
	paymentId: number,
	data: {
		amount?: number
		note?: string
		tagIds?: number[]
	}
) {
	const { tagIds, ...paymentData } = data

	const [payment] = await db
		.update(paymentTable)
		.set(paymentData)
		.where(eq(paymentTable.id, paymentId))
		.returning()

	if (tagIds !== undefined) {
		await db.delete(paymentsToTags).where(eq(paymentsToTags.paymentId, paymentId))

		if (tagIds.length > 0) {
			await db.insert(paymentsToTags).values(
				tagIds.map((tagId) => ({
					paymentId,
					tagId
				}))
			)
		}
	}

	return payment
}

export async function deletePayment(paymentId: number) {
	await db.delete(paymentsToTags).where(eq(paymentsToTags.paymentId, paymentId))
	await db.delete(paymentTable).where(eq(paymentTable.id, paymentId))
}
