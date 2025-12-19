import { db } from '../index';
import { payments, paymentsToTags } from '../schema';
import { eq, desc } from 'drizzle-orm';

export async function getPayment(paymentId: number) {
	return await db.query.payments.findFirst({
		where: eq(payments.id, paymentId),
		with: {
			user: true,
			paymentsToTags: {
				with: {
					tag: true
				}
			}
		}
	});
}

export async function getPaymentsByUser(userId: string) {
	return await db.query.payments.findMany({
		where: eq(payments.userId, userId),
		orderBy: desc(payments.createdAt),
		with: {
			paymentsToTags: {
				with: {
					tag: true
				}
			}
		}
	});
}

export async function getAllPayments() {
	return await db.query.payments.findMany({
		orderBy: desc(payments.createdAt),
		with: {
			user: true,
			paymentsToTags: {
				with: {
					tag: true
				}
			}
		}
	});
}

export async function createPayment(data: {
	amount: number;
	note?: string;
	userId: string;
	tagIds?: number[];
}) {
	const { tagIds, ...paymentData } = data;
	const [payment] = await db.insert(payments).values(paymentData).returning();

	if (tagIds && tagIds.length > 0) {
		await db.insert(paymentsToTags).values(
			tagIds.map((tagId) => ({
				paymentId: payment.id,
				tagId
			}))
		);
	}

	return payment;
}

export async function updatePayment(
	paymentId: number,
	data: {
		amount?: number;
		note?: string;
		tagIds?: number[];
	}
) {
	const { tagIds, ...paymentData } = data;

	const [payment] = await db
		.update(payments)
		.set(paymentData)
		.where(eq(payments.id, paymentId))
		.returning();

	if (tagIds !== undefined) {
		await db.delete(paymentsToTags).where(eq(paymentsToTags.paymentId, paymentId));

		if (tagIds.length > 0) {
			await db.insert(paymentsToTags).values(
				tagIds.map((tagId) => ({
					paymentId,
					tagId
				}))
			);
		}
	}

	return payment;
}

export async function deletePayment(paymentId: number) {
	await db.delete(paymentsToTags).where(eq(paymentsToTags.paymentId, paymentId));
	await db.delete(payments).where(eq(payments.id, paymentId));
}
