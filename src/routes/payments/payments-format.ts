// Pure formatting + grouping helpers for the payments table.

export type Tag = { id: number; name: string; color: string; icon: string }

export type Row = {
	id: number
	amount: number
	note: string | null
	createdAt: string | Date
	tags: Tag[]
}

// Body rows are flat when sorted by amount, and day-grouped (with subtotals) when sorted by date.
export type BodyItem = { kind: 'divider'; label: string; subtotal: number } | { kind: 'row'; row: Row }

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** Local calendar day for a date, as `YYYY-MM-DD`. */
function toIsoDay(d: string | Date): string {
	const dt = new Date(d)
	const tz = dt.getTimezoneOffset() * 60000
	return new Date(dt.getTime() - tz).toISOString().slice(0, 10)
}

/** Day-divider label, e.g. `Today · Jun 18`, `Yesterday · Jun 17`, `Tue · Jun 16`. */
function formatDayHeader(iso: string): string {
	const d = new Date(iso + 'T00:00:00')
	const today = new Date()
	today.setHours(0, 0, 0, 0)
	const diff = Math.round((today.getTime() - d.getTime()) / 86400000)
	const md = `${months[d.getMonth()]} ${d.getDate()}`
	if (diff === 0) return `Today · ${md}`
	if (diff === 1) return `Yesterday · ${md}`
	return `${weekdays[d.getDay()]} · ${md}`
}

/** Full row date, e.g. `Jun 18, 2026`. */
export function formatRowDate(d: string | Date): string {
	const dt = new Date(d)
	return `${months[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`
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
