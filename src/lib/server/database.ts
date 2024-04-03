import prisma from '@prisma/client'
import type { Payment, PaymentFilters } from '../zodSchemas'

export const db = new prisma.PrismaClient()

export const addPayment = async ({ amount, tags, date, note }: Payment, userId: string) => {
	const storedTags = await db.tag.findMany({
		where: {
			OR: tags.map((n: any) => ({
				name: n
			}))
		}
	})
	const newTagsNames = tags.filter((name: any) => !storedTags.some((tag) => tag.name === name))

	const create = newTagsNames.map((t) => ({ name: t }))
	const connect = storedTags.map((t) => ({ id: t.id }))

	const payment = await db.payment.create({
		data: {
			amount,
			note,
			createdAt: new Date(date),
			userId,
			tags: {
				create,
				connect
			}
		},
		include: { tags: true }
	})

	return payment
}

export const getPayments = async (filters: PaymentFilters, userId: string) => {
	const tagsFilters =
		filters.tags.length != 0 && filters.tags[0]?.length != 0
			? {
					some: {
						name: { in: filters.tags }
					}
				}
			: {}

	const payments = await db.payment.findMany({
		where: {
			userId,
			createdAt: { gte: filters.startDate, lte: filters.endDate },
			tags: tagsFilters
		},
		include: { tags: { select: { name: true } } },
		orderBy: [
			filters.sortBy === 'amount'
				? {
						amount: filters.sortType
					}
				: {
						createdAt: filters.sortType
					}
		]
	})

	const filteredPaymenst = payments.map((p) => ({ ...p, tags: p.tags.map((t) => t.name) }))

	return filteredPaymenst
}

export const getUserTags = async (userId: string) => {
	const tags = await db.tag.findMany({
		select: { name: true },
		where: {
			payments: {
				some: { userId: userId }
			}
		}
	})

	return tags.map((t) => t.name)
}

export const removePayment = async (id: number, userId: string) => {
	await db.payment.delete({ where: { id, userId } })
}

export const getPayment = async (id: number) => {
	const payment = await db.payment.findUnique({
		where: { id },
		include: { tags: true }
	})

	return payment
}
