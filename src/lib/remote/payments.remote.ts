import { command, query } from '$app/server'
import { db } from '$lib/server/db'
import { payment, paymentsToTags, tag } from '$lib/server/db/schema'
import { and, asc, desc, eq, gte, ilike, inArray, isNotNull, lte, or, sql } from 'drizzle-orm'
import { getLoggedInUser } from '$lib/remote/auth.remote'
import { reanchorRollingRule } from '$lib/server/recurring'
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
		recurringPaymentId: p.recurringPaymentId,
		confirmed: p.confirmed,
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

const paymentUpdateSchema = v.object({
	id: v.number(),
	amount: v.pipe(v.number(), v.minValue(0)),
	note: v.string(),
	tags: v.array(v.number()),
	date: v.date()
})

export const updatePayment = command(paymentUpdateSchema, async ({ id, amount, note, tags, date }) => {
	const user = await getLoggedInUser()

	let recurringId: number | null = null
	await db.transaction(async (tx) => {
		const [updated] = await tx
			.update(payment)
			.set({ amount: Math.round(amount), note, createdAt: date })
			.where(and(eq(payment.id, id), eq(payment.userId, user.id)))
			.returning({ id: payment.id, recurringPaymentId: payment.recurringPaymentId })
		if (!updated) return
		recurringId = updated.recurringPaymentId

		await tx.delete(paymentsToTags).where(eq(paymentsToTags.paymentId, id))
		if (tags.length > 0) {
			await tx.insert(paymentsToTags).values(tags.map((tagId) => ({ paymentId: id, tagId })))
		}
	})

	// Editing a rolling rule's payment date moves its cycle (no-op for fixed rules).
	if (recurringId != null) await reanchorRollingRule(recurringId)

	getPayments().refresh()
})

export const confirmPayment = command(v.number(), async (id) => {
	const user = await getLoggedInUser()

	await db
		.update(payment)
		.set({ confirmed: true })
		.where(and(eq(payment.id, id), eq(payment.userId, user.id)))

	getPayments().refresh()
})

export const confirmAllPendingPayments = command(async () => {
	const user = await getLoggedInUser()

	await db
		.update(payment)
		.set({ confirmed: true })
		.where(and(eq(payment.userId, user.id), eq(payment.confirmed, false)))

	getPayments().refresh()
})

export const deletePayment = command(v.number(), async (id) => {
	const user = await getLoggedInUser()

	let recurringId: number | null = null
	await db.transaction(async (tx) => {
		const [owned] = await tx
			.select({ id: payment.id, recurringPaymentId: payment.recurringPaymentId })
			.from(payment)
			.where(and(eq(payment.id, id), eq(payment.userId, user.id)))
		if (!owned) return
		recurringId = owned.recurringPaymentId

		await tx.delete(paymentsToTags).where(eq(paymentsToTags.paymentId, id))
		await tx.delete(payment).where(eq(payment.id, id))
	})

	// Deleting a rolling rule's latest payment rolls its cycle back (no-op for fixed rules).
	if (recurringId != null) await reanchorRollingRule(recurringId)

	getPayments().refresh()
})

const pageArgsSchema = v.object({
	page: v.pipe(v.number(), v.integer(), v.minValue(0)),
	pageSize: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(200)),
	sort: v.picklist(['date', 'amount']),
	dir: v.picklist(['asc', 'desc']),
	search: v.string(),
	tagIds: v.array(v.number()),
	amountMin: v.nullable(v.number()),
	amountMax: v.nullable(v.number()),
	dateStart: v.nullable(v.string()),
	dateEnd: v.nullable(v.string()),
	confirmed: v.picklist(['all', 'pending', 'confirmed']),
	recurringOnly: v.boolean()
})

export const getPaymentsPage = query(pageArgsSchema, async (args) => {
	const user = await getLoggedInUser()

	const filters = [eq(payment.userId, user.id)]

	if (args.amountMin != null) filters.push(gte(payment.amount, Math.round(args.amountMin)))
	if (args.amountMax != null) filters.push(lte(payment.amount, Math.round(args.amountMax)))
	if (args.dateStart) filters.push(gte(payment.createdAt, new Date(args.dateStart + 'T00:00:00')))
	if (args.dateEnd) filters.push(lte(payment.createdAt, new Date(args.dateEnd + 'T23:59:59.999')))
	if (args.search.trim()) {
		const like = `%${args.search.trim()}%`
		const tagMatch = db
			.select({ id: paymentsToTags.paymentId })
			.from(paymentsToTags)
			.innerJoin(tag, eq(tag.id, paymentsToTags.tagId))
			.where(ilike(tag.name, like))
		filters.push(or(ilike(payment.note, like), inArray(payment.id, tagMatch))!)
	}
	if (args.tagIds.length) {
		const tagged = db
			.select({ id: paymentsToTags.paymentId })
			.from(paymentsToTags)
			.where(inArray(paymentsToTags.tagId, args.tagIds))
		filters.push(inArray(payment.id, tagged))
	}
	if (args.confirmed !== 'all') filters.push(eq(payment.confirmed, args.confirmed === 'confirmed'))
	if (args.recurringOnly) filters.push(isNotNull(payment.recurringPaymentId))

	const where = and(...filters)

	const orderCol = args.sort === 'amount' ? payment.amount : payment.createdAt
	const orderBy = args.dir === 'asc' ? asc(orderCol) : desc(orderCol)

	const rows = await db.query.payment.findMany({
		where,
		orderBy,
		limit: args.pageSize,
		offset: args.page * args.pageSize,
		with: { paymentsToTags: { with: { tag: true } } }
	})

	const [{ sum, total }] = await db
		.select({ total: sql<number>`count(*)::int`, sum: sql<number>`coalesce(sum(${payment.amount}), 0)::int` })
		.from(payment)
		.where(where)

	return {
		rows: rows.map((p) => ({
			id: p.id,
			amount: p.amount,
			note: p.note,
			createdAt: p.createdAt,
			recurringPaymentId: p.recurringPaymentId,
			confirmed: p.confirmed,
			tags: p.paymentsToTags.map((ptt) => ({
				id: ptt.tag.id,
				name: ptt.tag.name,
				color: ptt.tag.color,
				icon: ptt.tag.icon
			}))
		})),
		sum: sum,
		total: total
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
