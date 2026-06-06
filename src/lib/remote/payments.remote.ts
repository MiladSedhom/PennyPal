import { command, query } from '$app/server'
import { db } from '$lib/server/db'
import { payment, paymentsToTags, tag } from '$lib/server/db/schema'
import { and, asc, desc, eq, gte, ilike, inArray, lte, or, sql } from 'drizzle-orm'
import { getLoggedInUser } from '$lib/remote/auth.remote'
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
		tags: p.paymentsToTags.map((ptt) => ({
			id: ptt.tag.id,
			name: ptt.tag.name,
			color: ptt.tag.color,
			icon: ptt.tag.icon
		}))
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

	await db.transaction(async (tx) => {
		const insertedPayments = await tx
			.insert(payment)
			.values(
				payments.map((p) => ({
					amount: Math.round(p.amount),
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

// ---------------------------------------------------------------------------
// Server-side paginated / filtered / sorted payments for the Payments page.
// ---------------------------------------------------------------------------
const pageArgsSchema = v.object({
	page: v.pipe(v.number(), v.integer(), v.minValue(0)),
	pageSize: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(200)),
	sort: v.picklist(['date', 'amount']),
	dir: v.picklist(['asc', 'desc']),
	search: v.string(),
	tagIds: v.array(v.number()),
	amountMin: v.nullable(v.number()),
	amountMax: v.nullable(v.number()),
	// Inclusive day bounds as ISO 'YYYY-MM-DD', or null.
	dateStart: v.nullable(v.string()),
	dateEnd: v.nullable(v.string())
})

export const getPaymentsPage = query(pageArgsSchema, async (args) => {
	const user = await getLoggedInUser()

	const conds = [eq(payment.userId, user.id)]

	if (args.amountMin != null) conds.push(gte(payment.amount, Math.round(args.amountMin)))
	if (args.amountMax != null) conds.push(lte(payment.amount, Math.round(args.amountMax)))
	if (args.dateStart) conds.push(gte(payment.createdAt, new Date(args.dateStart + 'T00:00:00')))
	if (args.dateEnd) conds.push(lte(payment.createdAt, new Date(args.dateEnd + 'T23:59:59.999')))

	if (args.search.trim()) {
		const like = `%${args.search.trim()}%`
		// Payment ids whose tag name matches the search term.
		const tagMatch = db
			.select({ id: paymentsToTags.paymentId })
			.from(paymentsToTags)
			.innerJoin(tag, eq(tag.id, paymentsToTags.tagId))
			.where(ilike(tag.name, like))
		conds.push(or(ilike(payment.note, like), inArray(payment.id, tagMatch))!)
	}

	if (args.tagIds.length) {
		const tagged = db
			.select({ id: paymentsToTags.paymentId })
			.from(paymentsToTags)
			.where(inArray(paymentsToTags.tagId, args.tagIds))
		conds.push(inArray(payment.id, tagged))
	}

	const where = and(...conds)

	const [agg] = await db
		.select({ total: sql<number>`count(*)::int`, sum: sql<number>`coalesce(sum(${payment.amount}), 0)::int` })
		.from(payment)
		.where(where)

	const orderCol = args.sort === 'amount' ? payment.amount : payment.createdAt
	const orderBy = args.dir === 'asc' ? asc(orderCol) : desc(orderCol)

	const rows = await db.query.payment.findMany({
		where,
		orderBy,
		limit: args.pageSize,
		offset: args.page * args.pageSize,
		with: { paymentsToTags: { with: { tag: true } } }
	})

	return {
		rows: rows.map((p) => ({
			id: p.id,
			amount: p.amount,
			note: p.note,
			createdAt: p.createdAt,
			tags: p.paymentsToTags.map((ptt) => ({
				id: ptt.tag.id,
				name: ptt.tag.name,
				color: ptt.tag.color,
				icon: ptt.tag.icon
			}))
		})),
		total: agg.total,
		sum: agg.sum
	}
})

// Metadata for the filter bar: relevant tags (last 45 days) + amount domain.
export const getPaymentsMeta = query(async () => {
	const user = await getLoggedInUser()

	const cutoff = new Date(Date.now() - 45 * 86_400_000)

	const topTags = await db
		.select({
			id: tag.id,
			name: tag.name,
			color: tag.color,
			icon: tag.icon,
			count: sql<number>`count(*)::int`,
			spend: sql<number>`coalesce(sum(${payment.amount}), 0)::int`
		})
		.from(tag)
		.innerJoin(paymentsToTags, eq(paymentsToTags.tagId, tag.id))
		.innerJoin(payment, eq(payment.id, paymentsToTags.paymentId))
		.where(and(eq(tag.userId, user.id), gte(payment.createdAt, cutoff)))
		.groupBy(tag.id, tag.name, tag.color, tag.icon)

	const [{ maxAmount }] = await db
		.select({ maxAmount: sql<number>`coalesce(max(${payment.amount}), 0)::int` })
		.from(payment)
		.where(eq(payment.userId, user.id))

	return { topTags, maxAmount }
})
