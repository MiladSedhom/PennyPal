import { and, eq, inArray, isNull, lte, or } from 'drizzle-orm'
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
 * Generates Payment rows for every occurrence a user's recurring rules owe up to now,
 * backdated to their scheduled dates, then advances each rule's nextRunAt.
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

		for (const rule of rules) {
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
