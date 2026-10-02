import { onMount } from 'svelte'
import { Debounced, PersistedState, watch } from 'runed'
import { getLocalTimeZone, parseDate } from '@internationalized/date'
import type { DateRange } from 'bits-ui'

export type SortKey = 'date' | 'amount'
export type SortDir = 'asc' | 'desc'
export type RecurringStatusFilter = 'all' | 'pending' | 'confirmed'

type FilterSnapshot = {
	search: string
	tags: number[]
	min: number | null
	max: number | null
	from: string | null
	to: string | null
	sort: SortKey
	dir: SortDir
	status: RecurringStatusFilter
	recurringOnly: boolean
}

const DEFAULTS: FilterSnapshot = {
	search: '',
	tags: [],
	min: null,
	max: null,
	from: null,
	to: null,
	sort: 'date',
	dir: 'desc',
	status: 'all',
	recurringOnly: false
}

const STORAGE_KEY = 'pp:payment-filters'

/**
 * The payments filter bar state — search, tags, amount, date range, sort — with
 * its localStorage persistence handled internally. Instantiate once at the top of
 * the page `<script>`; components bind to the public fields directly.
 */
export class PaymentFilters {
	search = $state(DEFAULTS.search)
	tagIds = $state<number[]>([...DEFAULTS.tags])
	amountMin = $state<number | null>(DEFAULTS.min)
	amountMax = $state<number | null>(DEFAULTS.max)
	dateRange = $state<DateRange>({ start: undefined, end: undefined })
	sortKey = $state<SortKey>(DEFAULTS.sort)
	sortDir = $state<SortDir>(DEFAULTS.dir)
	status = $state<RecurringStatusFilter>(DEFAULTS.status)
	recurringOnly = $state(DEFAULTS.recurringOnly)

	#debouncedSearch = new Debounced(() => this.search, 300)
	#debouncedAmount = new Debounced(() => this.amountRange, 300)
	// seprate range for query so we contorl when they trigger a refetch.
	#dateRangeStart = $state<string | null>(DEFAULTS.from)
	#dateRangeEnd = $state<string | null>(DEFAULTS.to)
	#store = new PersistedState<FilterSnapshot>(STORAGE_KEY, DEFAULTS)

	constructor() {
		onMount(() => this.#restore())
		// Commit the picked range to the query only when it's a complete start+end pair (or fully
		// cleared); ignore the start-only state the calendar passes through during re-selection.
		watch(
			() => [this.dateRange.start, this.dateRange.end] as const,
			([start, end]) => {
				if (start && end) {
					this.#dateRangeStart = start.toString()
					this.#dateRangeEnd = end.toString()
				} else if (!start && !end) {
					this.#dateRangeStart = null
					this.#dateRangeEnd = null
				}
			}
		)

		watch(
			() => this.snapshot,
			(snapshot) => {
				this.#store.current = snapshot
			},
			{ lazy: true }
		)
	}

	get debouncedSearch(): string {
		return this.#debouncedSearch.current
	}

	get debouncedAmount(): { min: number | null; max: number | null } {
		return this.#debouncedAmount.current
	}

	// Typing a min above the max is allowed mid-edit; everything downstream reads the ordered range.
	get amountRange(): { min: number | null; max: number | null } {
		const { amountMin: min, amountMax: max } = this
		return min != null && max != null && min > max ? { min: max, max: min } : { min, max }
	}

	get isDateRangeActive(): boolean {
		return Boolean(this.dateRange.start || this.dateRange.end)
	}
	get isAmountActive(): boolean {
		return this.amountMin != null || this.amountMax != null
	}
	get isStatusActive(): boolean {
		return this.status !== DEFAULTS.status || this.recurringOnly !== DEFAULTS.recurringOnly
	}
	get activeCount(): number {
		return (
			[this.isDateRangeActive, this.isAmountActive, this.isStatusActive].filter(Boolean).length + this.tagIds.length
		)
	}

	get dateStart(): string | null {
		return this.#dateRangeStart
	}
	get dateEnd(): string | null {
		return this.#dateRangeEnd
	}

	// Resolved to instants here so the range follows the user's timezone, not the server's.
	get createdFrom(): string | null {
		return this.#dateRangeStart ? parseDate(this.#dateRangeStart).toDate(getLocalTimeZone()).toISOString() : null
	}
	get createdBefore(): string | null {
		return this.#dateRangeEnd
			? parseDate(this.#dateRangeEnd).add({ days: 1 }).toDate(getLocalTimeZone()).toISOString()
			: null
	}

	/** Serializable view of the filters; also the change signal for persistence. */
	get snapshot(): FilterSnapshot {
		return {
			search: this.search,
			tags: this.tagIds,
			min: this.amountMin,
			max: this.amountMax,
			from: this.dateStart,
			to: this.dateEnd,
			sort: this.sortKey,
			dir: this.sortDir,
			status: this.status,
			recurringOnly: this.recurringOnly
		}
	}

	#restore() {
		const stored = this.#store.current
		this.search = stored.search ?? DEFAULTS.search
		this.tagIds = [...(stored.tags ?? DEFAULTS.tags)]
		this.amountMin = stored.min ?? DEFAULTS.min
		this.amountMax = stored.max ?? DEFAULTS.max
		this.dateRange = {
			start: stored.from ? parseDate(stored.from) : undefined,
			end: stored.to ? parseDate(stored.to) : undefined
		}
		this.sortKey = stored.sort ?? DEFAULTS.sort
		this.sortDir = stored.dir ?? DEFAULTS.dir
		this.status = stored.status ?? DEFAULTS.status
		this.recurringOnly = stored.recurringOnly ?? DEFAULTS.recurringOnly
	}

	toggleTag = (id: number) => {
		this.tagIds = this.tagIds.includes(id) ? this.tagIds.filter((t) => t !== id) : [...this.tagIds, id]
	}
	clearTags = () => {
		this.tagIds = []
	}

	setAmount = (min: number | null, max: number | null) => {
		this.amountMin = min
		this.amountMax = max
	}
	clearAmount = () => {
		this.amountMin = null
		this.amountMax = null
	}

	clearDateRange = () => {
		this.dateRange = { start: undefined, end: undefined }
	}

	/**
	 * Commit the current selection to the query, including a start-only "from" date. Call when the
	 * date picker closes so a half-picked range still takes effect (a complete range already commits
	 * on its own via the constructor's watch).
	 */
	commitDateRange = () => {
		this.#dateRangeStart = this.dateRange.start ? this.dateRange.start.toString() : null
		this.#dateRangeEnd = this.dateRange.end ? this.dateRange.end.toString() : null
	}

	clearStatus = () => {
		this.status = DEFAULTS.status
		this.recurringOnly = DEFAULTS.recurringOnly
	}

	clearAll = () => {
		this.clearDateRange()
		this.clearAmount()
		this.clearTags()
		this.clearStatus()
	}

	setSort = (key: SortKey) => {
		this.sortKey = key
		this.sortDir = 'desc'
	}
}
