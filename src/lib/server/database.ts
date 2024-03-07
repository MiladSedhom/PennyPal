import prisma from '@prisma/client'
import type { payment, PaymentFilters } from '../zodSchemas'

export const db = new prisma.PrismaClient()

export const addPayment = async ({ amount, tags, date, note }: payment, userId: string) => {
	// because tags can be a string or an array of string
	tags = typeof tags === 'string' ? [tags] : [...tags]

	const storedTags = await db.tag.findMany({
		where: {
			OR: tags.map((n) => ({
				name: n
			}))
		}
	})
	const newTagsNames = tags.filter((name) => !storedTags.some((tag) => tag.name === name))

	const tagsCreate = [
		...storedTags.map((t) => ({ tag: { connect: { id: t.id } } })),
		...newTagsNames.map((t) => ({ tag: { create: { name: t } } }))
	]

	const payment = await db.payment.create({
		data: {
			amount,
			note,
			createdAt: new Date(date),
			userId,
			tags: {
				create: tagsCreate
			}
		},
		include: { tags: { select: { tag: { select: { name: true } } } } }
	})

	return payment
}

export const getPayments = async (filters: PaymentFilters, userId: string) => {
	const tagsFilters =
		filters.tags.length != 0 && filters.tags[0]?.length != 0
			? {
					some: {
						tag: {
							name: { in: filters.tags }
						}
					}
				}
			: {}

	const payments = await db.payment.findMany({
		where: {
			userId,
			createdAt: { gte: filters.startDate, lte: filters.endDate },
			tags: tagsFilters
		},
		include: { tags: { include: { tag: { select: { name: true } } } } },
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

	const formatedPayments = payments.map((p) => ({ ...p, tags: p.tags.map((o) => o.tag?.name) }))

	return formatedPayments
}

export const getUserTags = async (userId: string) => {
	const tags = await db.tag.findMany({
		select: { name: true },
		where: {
			payments: {
				some: {
					payment: { userId: userId }
				}
			}
		}
	})

	return tags.map((t) => t.name)
}
