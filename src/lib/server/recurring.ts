import { and, desc, eq, inArray, isNull, lte, or } from 'drizzle-orm'
import { db } from '$lib/server/db'
import { payment, paymentsToTags, recurringPayment, recurringPaymentsToTags } from '$lib/server/db/schema'
import { firstOccurrenceAtOrAfter, occurrence, type Schedule } from '$lib/recurrence'

// Per-instance throttle so the auth hook's call is a Map lookup on most requests.
const lastChecked = new Map<string, number>()
const THROTTLE_MS = 5 * 60_000

// A rule can't realistically owe more than this in one run; guards against schedule bugs.
const MAX_PAYMENTS_PER_RULE_PER_RUN = 1000

const dueRules = (userId: string, now: Date) =>
	and(
		eq(recurringPayment.userId, userId),
		eq(recurringPayment.paused, false),
		lte(recurringPayment.nextRunAt, now),
		or(isNull(recurringPayment.endDate), lte(recurringPayment.nextRunAt, recurringPayment.endDate))
	)

/**
 * Re-points a rolling rule's anchor at its most recent payment, so the next due date is
 * one interval after the user actually last paid. Call after any change to a rolling
 * rule's payments (generate, edit-date, delete, manual pay-now). No-op for fixed rules.
 */
export async function reanchorRollingRule(ruleId: number) {
	const [rule] = await db.select().from(recurringPayment).where(eq(recurringPayment.id, ruleId))
	if (!rule || !rule.rolling) return

	const [latest] = await db
		.select({ date: payment.createdAt })
		.from(payment)
		.where(eq(payment.recurringPaymentId, ruleId))
		.orderBy(desc(payment.createdAt))
		.limit(1)

	const anchorDate = latest?.date ?? rule.startDate
	const next = occurrence({ interval: rule.interval, intervalCount: rule.intervalCount, startDate: anchorDate }, 1)
	await db
		.update(recurringPayment)
		.set({ startDate: anchorDate, nextRunAt: next })
		.where(eq(recurringPayment.id, ruleId))
}

/**
 * Generates Payment rows for every occurrence a user's recurring rules owe up to now,
 * backdated to their scheduled dates, then advances each rule's nextRunAt.
 *
 * Fixed rules backfill every missed occurrence on their calendar anchor. Rolling rules
 * generate at most one outstanding payment at a time and re-anchor from it, so the cycle
 * follows the actual payment date rather than a fixed calendar.
 *
 * Trigger-agnostic: called from the auth hook on every request (throttled) and from
 * the recurring remote commands with `force` after a rule changes.
 */
export async function catchUpRecurringPayments(userId: string, opts?: { force?: boolean }) {
	const now = new Date()

	if (!opts?.force) {
		const last = lastChecked.get(userId)
		if (last && now.getTime() - last < THROTTLE_MS) return
	}
	lastChecked.set(userId, now.getTime())

	// Cheap indexed probe so the common nothing-due case skips the transaction.
	const due = await db.select({ id: recurringPayment.id }).from(recurringPayment).where(dueRules(userId, now)).limit(1)
	if (due.length === 0) return

	await db.transaction(async (tx) => {
		// skipLocked: a concurrent request generates for the rules it locked; we skip
		// them rather than double-generating, and they're no longer due once it commits.
		const rules = await tx
			.select()
			.from(recurringPayment)
			.where(dueRules(userId, now))
			.for('update', { skipLocked: true })
		if (rules.length === 0) return

		const tagRows = await tx
			.select()
			.from(recurringPaymentsToTags)
			.where(
				inArray(
					recurringPaymentsToTags.recurringPaymentId,
					rules.map((r) => r.id)
				)
			)

		// Rolling rules keep at most one outstanding (unconfirmed) payment, so an ignored
		// rule doesn't pile up one renewal per page load. Find which already have one.
		const rollingDueIds = rules.filter((r) => r.rolling).map((r) => r.id)
		const pendingRuleIds = new Set<number>()
		if (rollingDueIds.length > 0) {
			const pending = await tx
				.selectDistinct({ id: payment.recurringPaymentId })
				.from(payment)
				.where(and(inArray(payment.recurringPaymentId, rollingDueIds), eq(payment.confirmed, false)))
			for (const row of pending) if (row.id != null) pendingRuleIds.add(row.id)
		}

		const stampTags = async (ruleId: number, paymentId: number) => {
			const tagIds = tagRows.filter((t) => t.recurringPaymentId === ruleId).map((t) => t.tagId)
			if (tagIds.length > 0) {
				await tx.insert(paymentsToTags).values(tagIds.map((tagId) => ({ paymentId, tagId })))
			}
		}

		for (const rule of rules) {
			if (rule.rolling) {
				// One outstanding renewal at a time; skip if there's already a pending one.
				if (pendingRuleIds.has(rule.id)) continue

				const dueDate = rule.nextRunAt
				const [ins] = await tx
					.insert(payment)
					.values({
						amount: rule.amount,
						note: rule.note,
						createdAt: dueDate,
						recurringPaymentId: rule.id,
						confirmed: false,
						userId: rule.userId
					})
					.returning({ id: payment.id })
				await stampTags(rule.id, ins.id)

				// Re-anchor from this just-created payment (it's now the latest).
				const next = occurrence({ interval: rule.interval, intervalCount: rule.intervalCount, startDate: dueDate }, 1)
				await tx
					.update(recurringPayment)
					.set({ startDate: dueDate, nextRunAt: next })
					.where(eq(recurringPayment.id, rule.id))
				continue
			}

			// Fixed: backfill every occurrence owed on the calendar anchor.
			const schedule: Schedule = {
				interval: rule.interval,
				intervalCount: rule.intervalCount,
				startDate: rule.startDate
			}

			let { n } = firstOccurrenceAtOrAfter(schedule, rule.nextRunAt)
			const owed: Date[] = []
			while (owed.length < MAX_PAYMENTS_PER_RULE_PER_RUN) {
				const date = occurrence(schedule, n)
				if (date.getTime() > now.getTime()) break
				if (rule.endDate && date.getTime() > rule.endDate.getTime()) break
				owed.push(date)
				n++
			}

			if (owed.length > 0) {
				const inserted = await tx
					.insert(payment)
					.values(
						owed.map((date) => ({
							amount: rule.amount,
							note: rule.note,
							createdAt: date,
							recurringPaymentId: rule.id,
							confirmed: false,
							userId: rule.userId
						}))
					)
					.returning({ id: payment.id })

				const tagIds = tagRows.filter((t) => t.recurringPaymentId === rule.id).map((t) => t.tagId)
				if (tagIds.length > 0) {
					await tx
						.insert(paymentsToTags)
						.values(inserted.flatMap((p) => tagIds.map((tagId) => ({ paymentId: p.id, tagId }))))
				}
			}

			await tx
				.update(recurringPayment)
				.set({ nextRunAt: occurrence(schedule, n) })
				.where(eq(recurringPayment.id, rule.id))
		}
	})
}
