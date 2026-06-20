export type RecurringInterval = 'daily' | 'weekly' | 'monthly' | 'yearly'

export type Schedule = {
	interval: RecurringInterval
	intervalCount: number
	startDate: Date
}

export const MAX_INTERVAL_COUNT = 52

/**
 * The nth occurrence (0-based) of a schedule, always computed from the startDate
 * anchor so monthly day-clamping never compounds: Jan 31 → Feb 28 → Mar 31.
 * Preserves the anchor's time of day.
 */
export function occurrence(s: Schedule, n: number): Date {
	const start = s.startDate
	if (s.interval === 'daily' || s.interval === 'weekly') {
		const daysPerStep = s.interval === 'weekly' ? 7 : 1
		const d = new Date(start)
		d.setDate(d.getDate() + n * daysPerStep * s.intervalCount)
		return d
	}
	const monthsPerStep = s.interval === 'monthly' ? s.intervalCount : s.intervalCount * 12
	const totalMonths = start.getMonth() + n * monthsPerStep
	const year = start.getFullYear() + Math.floor(totalMonths / 12)
	const month = totalMonths % 12
	const daysInMonth = new Date(year, month + 1, 0).getDate()
	const day = Math.min(start.getDate(), daysInMonth)
	return new Date(year, month, day, start.getHours(), start.getMinutes(), start.getSeconds(), start.getMilliseconds())
}

// A weekly schedule needs ~52 iterations per year; this guards against runaway
// loops from absurd inputs while allowing several centuries of catch-up.
const MAX_OCCURRENCE_SEARCH = 20_000

export function firstOccurrenceAtOrAfter(s: Schedule, from: Date): { n: number; date: Date } {
	for (let n = 0; n < MAX_OCCURRENCE_SEARCH; n++) {
		const date = occurrence(s, n)
		if (date.getTime() >= from.getTime()) return { n, date }
	}
	throw new Error(`No occurrence found within ${MAX_OCCURRENCE_SEARCH} steps — schedule too far in the past`)
}

/** The next `count` occurrences at or after `from`, stopping at endDate if given. */
export function nextOccurrences(s: Schedule, from: Date, count: number, endDate?: Date | null): Date[] {
	const out: Date[] = []
	let { n } = firstOccurrenceAtOrAfter(s, from)
	while (out.length < count) {
		const date = occurrence(s, n)
		if (endDate && date.getTime() > endDate.getTime()) break
		out.push(date)
		n++
	}
	return out
}

export function formatCadence(interval: RecurringInterval, intervalCount: number): string {
	if (intervalCount === 1) {
		return { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' }[interval]
	}
	const unit = { daily: 'days', weekly: 'weeks', monthly: 'months', yearly: 'years' }[interval]
	return `Every ${intervalCount} ${unit}`
}

/** Singular/plural unit for the "repeats every N ___" control. */
export function intervalUnit(interval: RecurringInterval, intervalCount: number): string {
	const singular = { daily: 'day', weekly: 'week', monthly: 'month', yearly: 'year' }[interval]
	return intervalCount === 1 ? singular : `${singular}s`
}
