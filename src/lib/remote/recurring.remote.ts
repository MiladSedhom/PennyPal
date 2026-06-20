import { command, query } from '$app/server'
import { db } from '$lib/server/db'
import { recurringPayment, recurringPaymentsToTags } from '$lib/server/db/schema'
import { and, asc, eq } from 'drizzle-orm'
import { getLoggedInUser } from './auth.remote'
import { getPayments } from './payments.remote'
import { catchUpRecurringPayments } from '$lib/server/recurring'
import { firstOccurrenceAtOrAfter, MAX_INTERVAL_COUNT, type Schedule } from '$lib/recurrence'
import * as v from 'valibot'

export const getRecurringPayments = query(async () => {
	const user = await getLoggedInUser()

	const rules = await db.query.recurringPayment.findMany({
		where: eq(recurringPayment.userId, user.id),
		orderBy: asc(recurringPayment.nextRunAt),
		with: { recurringPaymentsToTags: { with: { tag: true } } }
	})

	return rules.map((r) => ({
		id: r.id,
		amount: r.amount,
		note: r.note,
		interval: r.interval,
		intervalCount: r.intervalCount,
		startDate: r.startDate,
		nextRunAt: r.nextRunAt,
		endDate: r.endDate,
		paused: r.paused,
		tags: r.recurringPaymentsToTags.map((rt) => ({
			id: rt.tag.id,
			name: rt.tag.name,
			color: rt.tag.color,
			icon: rt.tag.icon
		}))
	}))
})

const ruleFields = {
	amount: v.pipe(v.number(), v.minValue(1)),
	note: v.string(),
	tags: v.array(v.number()),
	interval: v.picklist(['daily', 'weekly', 'monthly', 'yearly'] as const),
	intervalCount: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(MAX_INTERVAL_COUNT)),
	startDate: v.date(),
	endDate: v.nullable(v.date())
}
const endAfterStart = 'End date must be after the start date.'
const createRuleSchema = v.pipe(
	v.object(ruleFields),
	v.check((r) => r.endDate === null || r.endDate >= r.startDate, endAfterStart)
)
const updateRuleSchema = v.pipe(
	v.object({ id: v.number(), ...ruleFields }),
	v.check((r) => r.endDate === null || r.endDate >= r.startDate, endAfterStart)
)

export const createRecurringPayment = command(createRuleSchema, async (input) => {
	const user = await getLoggedInUser()

	await db.transaction(async (tx) => {
		const [rule] = await tx
			.insert(recurringPayment)
			.values({
				amount: Math.round(input.amount),
				note: input.note,
				interval: input.interval,
				intervalCount: input.intervalCount,
				startDate: input.startDate,
				nextRunAt: input.startDate,
				endDate: input.endDate,
				userId: user.id
			})
			.returning({ id: recurringPayment.id })

		if (input.tags.length > 0) {
			await tx
				.insert(recurringPaymentsToTags)
				.values(input.tags.map((tagId) => ({ recurringPaymentId: rule.id, tagId })))
		}
	})

	// A rule starting in the past owes payments right away — don't wait for the next request.
	if (input.startDate.getTime() <= Date.now()) {
		await catchUpRecurringPayments(user.id, { force: true })
		getPayments().refresh()
	}

	getRecurringPayments().refresh()
})

export const updateRecurringPayment = command(updateRuleSchema, async (input) => {
	const user = await getLoggedInUser()

	const [existing] = await db
		.select()
		.from(recurringPayment)
		.where(and(eq(recurringPayment.id, input.id), eq(recurringPayment.userId, user.id)))
	if (!existing) return

	const schedule: Schedule = {
		interval: input.interval,
		intervalCount: input.intervalCount,
		startDate: input.startDate
	}
	// Watermark: edits never regenerate history — the new schedule resumes from
	// wherever the rule had already advanced to.
	const nextRunAt = firstOccurrenceAtOrAfter(schedule, existing.nextRunAt).date

	await db.transaction(async (tx) => {
		await tx
			.update(recurringPayment)
			.set({
				amount: Math.round(input.amount),
				note: input.note,
				interval: input.interval,
				intervalCount: input.intervalCount,
				startDate: input.startDate,
				endDate: input.endDate,
				nextRunAt
			})
			.where(eq(recurringPayment.id, input.id))

		await tx.delete(recurringPaymentsToTags).where(eq(recurringPaymentsToTags.recurringPaymentId, input.id))
		if (input.tags.length > 0) {
			await tx
				.insert(recurringPaymentsToTags)
				.values(input.tags.map((tagId) => ({ recurringPaymentId: input.id, tagId })))
		}
	})

	await catchUpRecurringPayments(user.id, { force: true })
	getPayments().refresh()
	getRecurringPayments().refresh()
})

export const deleteRecurringPayment = command(v.number(), async (id) => {
	const user = await getLoggedInUser()

	const owned = await db
		.select({ id: recurringPayment.id })
		.from(recurringPayment)
		.where(and(eq(recurringPayment.id, id), eq(recurringPayment.userId, user.id)))
	if (owned.length === 0) return

	// Generated payments survive: Payment.recurringPaymentId is set null by the FK.
	await db.transaction(async (tx) => {
		await tx.delete(recurringPaymentsToTags).where(eq(recurringPaymentsToTags.recurringPaymentId, id))
		await tx.delete(recurringPayment).where(eq(recurringPayment.id, id))
	})

	getRecurringPayments().refresh()
	getPayments().refresh()
})

export const setRecurringPaused = command(v.object({ id: v.number(), paused: v.boolean() }), async ({ id, paused }) => {
	const user = await getLoggedInUser()

	const [rule] = await db
		.select()
		.from(recurringPayment)
		.where(and(eq(recurringPayment.id, id), eq(recurringPayment.userId, user.id)))
	if (!rule) return

	// Resuming skips occurrences missed while paused — that's what pausing means.
	const nextRunAt = paused
		? rule.nextRunAt
		: firstOccurrenceAtOrAfter(
				{ interval: rule.interval, intervalCount: rule.intervalCount, startDate: rule.startDate },
				new Date()
			).date

	await db.update(recurringPayment).set({ paused, nextRunAt }).where(eq(recurringPayment.id, id))

	getRecurringPayments().refresh()
})
