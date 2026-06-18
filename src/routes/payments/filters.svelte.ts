import { onMount } from 'svelte'
import { Debounced, PersistedState, watch } from 'runed'
import { parseDate } from '@internationalized/date'
import type { DateRange } from 'bits-ui'

export type SortKey = 'date' | 'amount'
export type SortDir = 'asc' | 'desc'

type FilterSnapshot = {
	search: string
	tags: number[]
	min: number | null
	max: number | null
	from: string | null
	to: string | null
	sort: SortKey
	dir: SortDir
}

const DEFAULTS: FilterSnapshot = {
	search: '',
	tags: [],
	min: null,
	max: null,
	from: null,
	to: null,
	sort: 'date',
	dir: 'desc'
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
	range = $state<DateRange>({ start: undefined, end: undefined })
	sortKey = $state<SortKey>(DEFAULTS.sort)
	sortDir = $state<SortDir>(DEFAULTS.dir)

	#debouncedSearch = new Debounced(() => this.search, 300)
	// Dragging the amount slider streams values continuously; debounce before they reach the
	// server query so a drag doesn't fire a request (and table re-render) on every pixel.
	#debouncedAmount = new Debounced(() => ({ min: this.amountMin, max: this.amountMax }), 300)
	#store = new PersistedState<FilterSnapshot>(STORAGE_KEY, DEFAULTS)

	constructor() {
		// Restore once, after mount: localStorage is unavailable during SSR, so deferring
		// keeps the server render and the first client render identical (no hydration flash).
		onMount(() => this.#restore())
		// Persist on change. `lazy` skips the initial run so the defaults can't overwrite
		// what's already stored before #restore() applies it.
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

	/** Debounced amount bounds — use these for server queries, not `amountMin`/`amountMax`. */
	get debouncedAmount(): { min: number | null; max: number | null } {
		return this.#debouncedAmount.current
	}

	/** Date range as `YYYY-MM-DD` strings for the server query. */
	get dateStart(): string | null {
		return this.range.start ? this.range.start.toString() : null
	}
	get dateEnd(): string | null {
		return this.range.end ? this.range.end.toString() : null
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
			dir: this.sortDir
		}
	}

	#restore() {
		const stored = this.#store.current
		this.search = stored.search ?? DEFAULTS.search
		this.tagIds = [...(stored.tags ?? DEFAULTS.tags)]
		this.amountMin = stored.min ?? DEFAULTS.min
		this.amountMax = stored.max ?? DEFAULTS.max
		this.range = {
			start: stored.from ? parseDate(stored.from) : undefined,
			end: stored.to ? parseDate(stored.to) : undefined
		}
		this.sortKey = stored.sort ?? DEFAULTS.sort
		this.sortDir = stored.dir ?? DEFAULTS.dir
	}

	toggleTag(id: number) {
		this.tagIds = this.tagIds.includes(id) ? this.tagIds.filter((t) => t !== id) : [...this.tagIds, id]
	}
	clearTags() {
		this.tagIds = []
	}

	setAmount(min: number | null, max: number | null) {
		this.amountMin = min
		this.amountMax = max
	}
	clearAmount() {
		this.amountMin = null
		this.amountMax = null
	}

	clearRange() {
		this.range = { start: undefined, end: undefined }
	}

	setSort(key: SortKey) {
		this.sortKey = key
		this.sortDir = 'desc'
	}
}
