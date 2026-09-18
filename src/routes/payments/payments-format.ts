// Pure formatting + grouping helpers for the payments table.

export type Tag = { id: number; name: string; color: string; icon: string }

export type Row = {
	id: number
	amount: number
	note: string | null
	createdAt: string | Date
	recurringPaymentId: number | null
	confirmed: boolean
	tags: Tag[]
}

// Body rows are flat when sorted by amount, and day-grouped (with subtotals) when sorted by date.
export type BodyItem = { kind: 'divider'; label: string; subtotal: number } | { kind: 'row'; row: Row }

// Locale is pinned so the server render and the browser agree (no hydration mismatch).
const weekdayFormat = new Intl.DateTimeFormat('en-US', { weekday: 'long' })
const monthDayFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
const rowDateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

/** Local calendar day for a date, as `YYYY-MM-DD`. */
function toIsoDay(d: string | Date): string {
	const dt = new Date(d)
	const tz = dt.getTimezoneOffset() * 60000
	return new Date(dt.getTime() - tz).toISOString().slice(0, 10)
}

/** Day-divider label, e.g. `Today · Jun 18`, `Yesterday · Jun 17`, `Tuesday · Jun 16`. */
function formatDayHeader(iso: string): string {
	const d = new Date(iso + 'T00:00:00')
	const today = new Date()
	today.setHours(0, 0, 0, 0)
	const daysAgo = Math.round((today.getTime() - d.getTime()) / 86_400_000)
	const monthDay = monthDayFormat.format(d)
	if (daysAgo === 0) return `Today, ${monthDay}`
	if (daysAgo === 1) return `Yesterday, ${monthDay}`
	return `${weekdayFormat.format(d)}, ${monthDay}`
}

/** Full row date, e.g. `Jun 18, 2026`. */
export function formatRowDate(d: string | Date): string {
	return rowDateFormat.format(new Date(d))
}

/** Group consecutive rows by calendar day, inserting a divider with the day's subtotal before each group. */
export function groupByDay(rows: Row[]): BodyItem[] {
	const items: BodyItem[] = []
	let i = 0
	while (i < rows.length) {
		const day = toIsoDay(rows[i].createdAt)
		let j = i
		let subtotal = 0
		while (j < rows.length && toIsoDay(rows[j].createdAt) === day) {
			subtotal += rows[j].amount
			j++
		}
		items.push({ kind: 'divider', label: formatDayHeader(day), subtotal })
		for (let k = i; k < j; k++) items.push({ kind: 'row', row: rows[k] })
		i = j
	}
	return items
}
