<script lang="ts">
	import { untrack } from 'svelte'
	import { getPaymentsPage, getPaymentsMeta } from '$lib/remote/payments.remote'
	import { getTags } from '$lib/remote/tags.remote'
	import PaymentsForm from '$lib/components/payments-form.svelte'
	import { SvelteDate, SvelteMap, SvelteSet } from 'svelte/reactivity'
	import { Debounced } from 'runed'

	import Card from '$lib/components/pp/card.svelte'
	import Caption from '$lib/components/pp/caption.svelte'
	import TagChip from '$lib/components/pp/tag-chip.svelte'
	import TagIconChip from '$lib/components/pp/tag-icon-chip.svelte'
	import { getSwatch, getIcon } from '$lib/tag-meta'
	import { formatMoney } from '$lib/utils'
	import { Button } from '$lib/components/ui/button'
	import * as Table from '$lib/components/ui/table'
	import * as Popover from '$lib/components/ui/popover'
	import { RangeCalendar } from '$lib/components/ui/range-calendar'
	import { Slider } from '$lib/components/ui/slider'
	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table'
	import { createColumnHelper, getCoreRowModel, type SortingState, type PaginationState } from '@tanstack/table-core'
	import { DateFormatter } from '@internationalized/date'
	import { type DateRange } from 'bits-ui'

	import SearchIcon from '@lucide/svelte/icons/search'
	import XIcon from '@lucide/svelte/icons/x'
	import CheckIcon from '@lucide/svelte/icons/check'
	import CalendarIcon from '@lucide/svelte/icons/calendar'
	import WalletIcon from '@lucide/svelte/icons/wallet'
	import TagIcon from '@lucide/svelte/icons/tag'
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right'
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left'
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right'

	type Row = {
		id: number
		amount: number
		note: string | null
		createdAt: string | Date
		tags: { id: number; name: string; color: string; icon: string }[]
	}

	// --- filter / sort / paging state ---
	let q = $state('')
	const qDebounced = new Debounced(() => q, 300)
	let activeTagIds = $state<number[]>([])
	let amountMin = $state<number | null>(null)
	let amountMax = $state<number | null>(null)
	let range = $state<DateRange>({ start: undefined, end: undefined })
	let tagSearch = $state('')

	let sorting = $state<SortingState>([{ id: 'date', desc: true }])
	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 25 })

	const sortKey = $derived(sorting[0]?.id === 'amount' ? 'amount' : 'date')
	const sortDir = $derived(sorting[0]?.desc === false ? 'asc' : 'desc')

	const args = $derived({
		page: pagination.pageIndex,
		pageSize: pagination.pageSize,
		sort: sortKey as 'date' | 'amount',
		dir: sortDir as 'asc' | 'desc',
		search: qDebounced.current,
		tagIds: activeTagIds,
		amountMin,
		amountMax,
		dateStart: range.start ? range.start.toString() : null,
		dateEnd: range.end ? range.end.toString() : null
	})

	const pageData = $derived(await getPaymentsPage(args))
	const meta = $derived(await getPaymentsMeta())
	const tags = $derived(await getTags())

	// Reset to first page whenever a filter or sort changes (not on page change).
	const filterKey = $derived(
		JSON.stringify([
			qDebounced.current,
			activeTagIds,
			amountMin,
			amountMax,
			args.dateStart,
			args.dateEnd,
			sortKey,
			sortDir
		])
	)
	$effect(() => {
		// reference filterKey so this effect re-runs on any filter/sort change
		void filterKey
		untrack(() => {
			pagination.pageIndex = 0
		})
	})

	// --- TanStack table (manual everything; server owns filter/sort/page) ---
	const columnHelper = createColumnHelper<Row>()
	// The Date column only appears when sorting by amount; in date-sort the day
	// dividers already carry the date, so an extra column would be redundant.
	const columns = $derived([
		columnHelper.accessor('amount', { id: 'amount', header: 'Amount', enableSorting: true }),
		...(sortKey === 'amount'
			? [columnHelper.accessor('createdAt', { id: 'date', header: 'Date', enableSorting: false })]
			: []),
		columnHelper.display({ id: 'tags', header: 'Tags', enableSorting: false }),
		columnHelper.display({ id: 'note', header: 'Note', enableSorting: false })
	])

	const table = createSvelteTable({
		get data() {
			return pageData.rows as Row[]
		},
		get columns() {
			return columns
		},
		state: {
			get sorting() {
				return sorting
			},
			get pagination() {
				return pagination
			}
		},
		get rowCount() {
			return pageData.total
		},
		manualSorting: true,
		manualFiltering: true,
		manualPagination: true,
		enableSortingRemoval: false,
		sortDescFirst: true,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: (updater) => {
			sorting = typeof updater === 'function' ? updater(sorting) : updater
		},
		onPaginationChange: (updater) => {
			pagination = typeof updater === 'function' ? updater(pagination) : updater
		}
	})

	// --- helpers ---
	function toggleTag(id: number) {
		activeTagIds = activeTagIds.includes(id) ? activeTagIds.filter((t) => t !== id) : [...activeTagIds, id]
	}
	function clearRange() {
		range = { start: undefined, end: undefined }
	}
	function clearAmount() {
		amountMin = null
		amountMax = null
	}

	function toIsoDay(d: string | Date) {
		const dt = new SvelteDate(d)
		const tz = dt.getTimezoneOffset() * 60000
		return new SvelteDate(dt.getTime() - tz).toISOString().slice(0, 10)
	}

	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
	const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

	function formatDayHeader(iso: string) {
		const d = new SvelteDate(iso + 'T00:00:00')
		const today = new SvelteDate()
		today.setHours(0, 0, 0, 0)
		const diff = Math.round((today.getTime() - d.getTime()) / 86400000)
		const md = `${months[d.getMonth()]} ${d.getDate()}`
		if (diff === 0) return `Today · ${md}`
		if (diff === 1) return `Yesterday · ${md}`
		return `${weekdays[d.getDay()]} · ${md}`
	}
	function formatRowDate(d: string | Date) {
		const dt = new SvelteDate(d)
		return `${months[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`
	}

	// Body items: flat when sorted by amount; day-grouped (with subtotals) when sorted by date.
	type BodyItem = { kind: 'divider'; label: string; subtotal: number } | { kind: 'row'; row: Row }
	const bodyItems = $derived.by<BodyItem[]>(() => {
		const rows = table.getRowModel().rows.map((r) => r.original)
		if (sortKey !== 'date') return rows.map((row) => ({ kind: 'row', row }))
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
	})

	// --- relevant tag chips (45-day window from server meta) ---
	const statById = $derived(new SvelteMap(meta.topTags.map((t) => [t.id, { count: t.count, spend: t.spend }])))
	const primaryTags = $derived.by(() => {
		const byCount = [...meta.topTags].sort((a, b) => b.count - a.count).slice(0, 6)
		const bySpend = [...meta.topTags].sort((a, b) => b.spend - a.spend).slice(0, 6)
		const ids = new SvelteSet<number>([...byCount, ...bySpend].map((t) => t.id))
		for (const id of activeTagIds) ids.add(id)
		return tags
			.filter((t) => ids.has(t.id))
			.sort((a, b) => {
				const sa = statById.get(a.id) ?? { count: 0, spend: 0 }
				const sb = statById.get(b.id) ?? { count: 0, spend: 0 }
				return sb.count - sa.count || sb.spend - sa.spend || a.name.localeCompare(b.name)
			})
	})
	const overflowTags = $derived.by(() => {
		const primary = new SvelteSet(primaryTags.map((t) => t.id))
		const rest = tags.filter((t) => !primary.has(t.id)).sort((a, b) => a.name.localeCompare(b.name))
		const s = tagSearch.trim().toLowerCase()
		return s ? rest.filter((t) => t.name.toLowerCase().includes(s)) : rest
	})
	const overflowCount = $derived(tags.length - primaryTags.length)

	// --- amount filter ---
	const amountCeil = $derived(Math.max(meta.maxAmount, 100))
	const sliderValue = $derived<[number, number]>([amountMin ?? 0, amountMax ?? amountCeil])
	function setSlider(v: number[]) {
		const [lo, hi] = v
		amountMin = lo <= 0 ? null : lo
		amountMax = hi >= amountCeil ? null : hi
	}
	type Bracket = { label: string; min: number | null; max: number | null }
	const brackets: Bracket[] = [
		{ label: '< $25', min: null, max: 25 },
		{ label: '$25–100', min: 25, max: 100 },
		{ label: '$100–500', min: 100, max: 500 },
		{ label: '$500+', min: 500, max: null }
	]
	function applyBracket(b: Bracket) {
		amountMin = b.min
		amountMax = b.max
	}
	const bracketActive = (b: Bracket) => amountMin === b.min && amountMax === b.max

	const amountLabel = $derived.by(() => {
		if (amountMin != null && amountMax != null) return `${formatMoney(amountMin)}–${formatMoney(amountMax)}`
		if (amountMin != null) return `≥ ${formatMoney(amountMin)}`
		if (amountMax != null) return `≤ ${formatMoney(amountMax)}`
		return 'Amount'
	})
	const amountActive = $derived(amountMin != null || amountMax != null)

	const rangeDf = new DateFormatter('en-US', { month: 'short', day: 'numeric' })
	const rangeLabel = $derived.by(() => {
		const { start, end } = range
		if (start && end) return `${rangeDf.format(start.toDate('UTC'))} – ${rangeDf.format(end.toDate('UTC'))}`
		if (start) return `From ${rangeDf.format(start.toDate('UTC'))}`
		return 'Date range'
	})

	const monthLabel = new SvelteDate().toLocaleString('en-US', { month: 'long', year: 'numeric' })
	const colCount = $derived(columns.length)
</script>

<div class="px-10 pb-14 pt-2">
	<div class="mb-[22px] flex items-end justify-between">
		<div>
			<Caption>{pageData.total} payments · {monthLabel}</Caption>
			<h1 class="m-0 mt-1.5 font-display text-[38px] font-bold tracking-[-0.04em] text-foreground">Payments</h1>
		</div>
		<div class="flex gap-2.5">
			<Button
				variant="outline"
				class="h-[40px] gap-2 rounded-full bg-transparent px-[18px] text-[13.5px] font-semibold"
			>
				<ArrowUpRightIcon size={15} /> Export
			</Button>
			<PaymentsForm
				onsaved={() => {
					getPaymentsPage(args).refresh()
					getPaymentsMeta().refresh()
				}}
			/>
		</div>
	</div>

	<!-- Filter bar -->
	<Card pad="md" class="mb-4">
		<div class="flex flex-wrap items-center gap-3">
			<div class="flex min-w-[200px] flex-1 items-center gap-2 rounded-full bg-bg-warm px-[14px] py-2">
				<SearchIcon size={14} class="text-text-mute" />
				<input
					bind:value={q}
					placeholder="Search notes, tags…"
					class="flex-1 border-none bg-transparent text-[13.5px] font-medium text-foreground outline-none placeholder:text-text-mute"
				/>
				{#if q}
					<button
						type="button"
						onclick={() => (q = '')}
						class="flex border-none bg-transparent p-0 text-text-mute"
						aria-label="Clear search"
					>
						<XIcon size={13} />
					</button>
				{/if}
			</div>

			<!-- Date range -->
			<Popover.Root>
				<Popover.Trigger>
					{#snippet child({ props })}
						<button
							{...props}
							type="button"
							class="inline-flex items-center gap-2 rounded-full bg-bg-warm px-[14px] py-2 text-[12.5px] font-semibold"
							class:text-foreground={range.start}
							class:text-text-mute={!range.start}
						>
							<CalendarIcon size={13} />
							{rangeLabel}
							{#if range.start || range.end}
								<span
									role="button"
									tabindex="0"
									onclick={(e) => {
										e.stopPropagation()
										clearRange()
									}}
									onkeydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.stopPropagation()
											clearRange()
										}
									}}
									class="flex text-text-mute hover:text-foreground"
									aria-label="Clear date range"
								>
									<XIcon size={13} />
								</span>
							{/if}
						</button>
					{/snippet}
				</Popover.Trigger>
				<Popover.Content class="w-auto rounded-2xl border-none bg-card p-2 shadow-xl" align="end">
					<RangeCalendar bind:value={range} numberOfMonths={2} />
				</Popover.Content>
			</Popover.Root>

			<!-- Amount -->
			<Popover.Root>
				<Popover.Trigger>
					{#snippet child({ props })}
						<button
							{...props}
							type="button"
							class="inline-flex items-center gap-2 rounded-full bg-bg-warm px-[14px] py-2 text-[12.5px] font-semibold"
							class:text-foreground={amountActive}
							class:text-text-mute={!amountActive}
						>
							<WalletIcon size={13} />
							{amountLabel}
							{#if amountActive}
								<span
									role="button"
									tabindex="0"
									onclick={(e) => {
										e.stopPropagation()
										clearAmount()
									}}
									onkeydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.stopPropagation()
											clearAmount()
										}
									}}
									class="flex text-text-mute hover:text-foreground"
									aria-label="Clear amount filter"
								>
									<XIcon size={13} />
								</span>
							{/if}
						</button>
					{/snippet}
				</Popover.Trigger>
				<Popover.Content class="w-[280px] rounded-2xl border-none bg-card p-4 shadow-xl" align="end">
					<Caption class="mb-2.5 block">Quick ranges</Caption>
					<div class="mb-4 flex flex-wrap gap-2">
						{#each brackets as b (b.label)}
							{@const on = bracketActive(b)}
							<button
								type="button"
								onclick={() => applyBracket(b)}
								class="rounded-full px-3 py-[6px] text-[12.5px] font-semibold"
								class:bg-mint={on}
								class:text-foreground={on}
								class:bg-bg-warm={!on}
								class:text-text-dim={!on}
							>
								{b.label}
							</button>
						{/each}
					</div>

					<Caption class="mb-3 block">Custom</Caption>
					<Slider type="multiple" value={sliderValue} onValueChange={setSlider} min={0} max={amountCeil} step={1} />
					<div class="mt-4 flex items-center gap-2">
						<div class="relative flex flex-1 items-center">
							<span class="absolute left-[12px] font-mono text-[13px] text-text-mute">$</span>
							<input
								inputmode="numeric"
								value={amountMin ?? ''}
								oninput={(e) => {
									const val = e.currentTarget.value.trim()
									amountMin = val === '' ? null : Math.max(0, Math.round(Number(val)))
								}}
								placeholder="Min"
								class="w-full rounded-[10px] border border-border bg-bg-warm py-[8px] pl-[24px] pr-[10px] font-mono text-[13px] font-medium text-foreground outline-none focus:border-primary"
							/>
						</div>
						<span class="text-text-mute">–</span>
						<div class="relative flex flex-1 items-center">
							<span class="absolute left-[12px] font-mono text-[13px] text-text-mute">$</span>
							<input
								inputmode="numeric"
								value={amountMax ?? ''}
								oninput={(e) => {
									const val = e.currentTarget.value.trim()
									amountMax = val === '' ? null : Math.max(0, Math.round(Number(val)))
								}}
								placeholder="Max"
								class="w-full rounded-[10px] border border-border bg-bg-warm py-[8px] pl-[24px] pr-[10px] font-mono text-[13px] font-medium text-foreground outline-none focus:border-primary"
							/>
						</div>
					</div>
					{#if amountActive}
						<button
							type="button"
							onclick={clearAmount}
							class="mt-3 w-full border-none bg-transparent text-[12.5px] font-semibold text-lime-text"
						>
							Clear
						</button>
					{/if}
				</Popover.Content>
			</Popover.Root>

			<!-- Sort -->
			<div class="inline-flex items-center gap-2">
				<Caption>Sort</Caption>
				<div class="inline-flex gap-1 rounded-full bg-bg-warm p-1">
					{#each [['date', 'Date'], ['amount', 'Amount']] as const as [k, lbl] (k)}
						<button
							type="button"
							onclick={() => (sorting = [{ id: k, desc: true }])}
							class="rounded-full border-none px-[14px] py-1.5 text-[12.5px] font-semibold"
							class:bg-card={sortKey === k}
							class:text-foreground={sortKey === k}
							class:shadow-xs={sortKey === k}
							class:bg-transparent={sortKey !== k}
							class:text-text-mute={sortKey !== k}
						>
							{lbl}
						</button>
					{/each}
				</div>
			</div>
		</div>

		<div class="mt-3.5 flex flex-wrap items-center gap-2">
			<Caption class="mr-0.5">Filter</Caption>
			{#each primaryTags as t (t.id)}
				{@const on = activeTagIds.includes(t.id)}
				{@const c = getSwatch(t.color)}
				{@const Icon = getIcon(t.icon)}
				<button
					type="button"
					onclick={() => toggleTag(t.id)}
					class="inline-flex items-center gap-1.5 rounded-full px-3 py-[5px] text-[12.5px] font-semibold"
					style:background={on ? c.bg : 'transparent'}
					style:color={on ? c.ink : 'var(--text-mute)'}
					style:border={on ? '1px solid transparent' : '1px solid var(--border-color)'}
				>
					<Icon size={12} />
					{t.name}
				</button>
			{/each}

			{#if overflowCount > 0}
				<Popover.Root>
					<Popover.Trigger>
						{#snippet child({ props })}
							<button
								{...props}
								type="button"
								class="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-[5px] text-[12.5px] font-semibold text-text-dim hover:text-foreground"
							>
								<TagIcon size={12} /> More tags
								<span class="text-text-mute">+{overflowCount}</span>
							</button>
						{/snippet}
					</Popover.Trigger>
					<Popover.Content class="w-[280px] rounded-2xl border-none bg-card p-2.5 shadow-xl" align="start">
						<div class="mb-2 flex items-center gap-2 rounded-[10px] bg-bg-warm px-2.5 py-1.5">
							<SearchIcon size={13} class="text-text-mute" />
							<input
								bind:value={tagSearch}
								placeholder="Search tags…"
								class="flex-1 border-none bg-transparent text-[13px] text-foreground outline-none placeholder:text-text-mute"
							/>
						</div>
						<div class="flex max-h-[300px] flex-col gap-0.5 overflow-y-auto">
							{#each overflowTags as t (t.id)}
								{@const on = activeTagIds.includes(t.id)}
								<button
									type="button"
									onclick={() => toggleTag(t.id)}
									class="flex w-full items-center gap-2.5 rounded-[10px] border-none px-2.5 py-2 text-left text-foreground"
									class:bg-bg-warm={on}
									class:bg-transparent={!on}
								>
									<TagIconChip color={t.color} icon={t.icon} size={26} />
									<span class="flex-1 text-[13.5px] font-semibold">{t.name}</span>
									{#if on}
										<CheckIcon size={15} class="text-lime-text" />
									{/if}
								</button>
							{:else}
								<div class="px-2.5 py-3 text-center text-[12.5px] text-text-mute">No tags match.</div>
							{/each}
						</div>
					</Popover.Content>
				</Popover.Root>
			{/if}

			{#if activeTagIds.length > 0}
				<button
					type="button"
					onclick={() => (activeTagIds = [])}
					class="ml-1 border-none bg-transparent text-[12.5px] font-semibold text-lime-text"
				>
					Clear
				</button>
			{/if}
		</div>
	</Card>

	<!-- Table -->
	<Card pad="none" class="overflow-hidden">
		<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row class="border-border-soft hover:bg-transparent">
						{#each headerGroup.headers as header (header.id)}
							<Table.Head
								class="px-6 py-3 {header.column.id === 'amount'
									? 'w-[130px]'
									: header.column.id === 'date'
										? 'w-[150px]'
										: ''}"
							>
								<span class="font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-text-mute">
									<FlexRender content={header.column.columnDef.header} context={header.getContext()} />
								</span>
							</Table.Head>
						{/each}
					</Table.Row>
				{/each}
			</Table.Header>

			<Table.Body>
				{#if pageData.rows.length === 0}
					<Table.Row class="hover:bg-transparent">
						<Table.Cell colspan={colCount} class="px-6 py-12 text-center text-[14px] text-text-mute">
							No payments match your filters.
						</Table.Cell>
					</Table.Row>
				{:else}
					{#each bodyItems as item, i (item.kind === 'row' ? `r${item.row.id}` : `d${i}`)}
						{#if item.kind === 'divider'}
							<Table.Row class="border-border-soft bg-bg-warm hover:bg-bg-warm">
								<Table.Cell colspan={colCount} class="px-6 py-2.5">
									<div class="flex items-center gap-3">
										<Caption class="!font-bold !text-foreground">{item.label}</Caption>
										<div class="flex-1"></div>
										<Caption>{formatMoney(item.subtotal)}</Caption>
									</div>
								</Table.Cell>
							</Table.Row>
						{:else}
							{@const r = item.row}
							<Table.Row class="border-border-soft">
								<Table.Cell class="px-6 py-[13px] text-[14.5px] font-semibold tabular-nums">
									{formatMoney(r.amount)}
								</Table.Cell>
								{#if sortKey === 'amount'}
									<Table.Cell class="px-6 py-[13px] text-[13px] text-text-dim tabular-nums">
										{formatRowDate(r.createdAt)}
									</Table.Cell>
								{/if}
								<Table.Cell class="px-6 py-[13px]">
									<span class="flex flex-wrap gap-1.5">
										{#if r.tags.length > 0}
											{#each r.tags as tag (tag.id)}
												<TagChip name={tag.name} color={tag.color} icon={tag.icon} size="sm" />
											{/each}
										{:else}
											<span class="text-[13px] text-text-mute">Untagged</span>
										{/if}
									</span>
								</Table.Cell>
								<Table.Cell class="px-6 py-[13px] text-[13px] {r.note ? 'text-text-dim' : 'text-text-mute'}">
									{r.note || '—'}
								</Table.Cell>
							</Table.Row>
						{/if}
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>

		<!-- Footer: pagination + total -->
		<div class="flex items-center justify-between border-t border-border px-6 py-4">
			<div class="flex items-center gap-3">
				<button
					type="button"
					onclick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
					class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border-soft text-text-dim disabled:opacity-40 enabled:hover:bg-bg-warm"
					aria-label="Previous page"
				>
					<ChevronLeftIcon size={15} />
				</button>
				<Caption>Page {pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}</Caption>
				<button
					type="button"
					onclick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
					class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border-soft text-text-dim disabled:opacity-40 enabled:hover:bg-bg-warm"
					aria-label="Next page"
				>
					<ChevronRightIcon size={15} />
				</button>
				<Caption class="ml-1">{pageData.total} total</Caption>
			</div>
			<div class="flex items-baseline gap-2.5">
				<Caption>Total</Caption>
				<span class="font-display text-[22px] font-bold tracking-[-0.02em] tabular-nums"
					>{formatMoney(pageData.sum)}</span
				>
			</div>
		</div>
	</Card>
</div>
