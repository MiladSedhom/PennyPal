<script lang="ts">
	import {
		DateFormatter,
		getLocalTimeZone,
		today,
		startOfMonth,
		endOfMonth,
		startOfYear,
		endOfYear,
		type DateValue
	} from '@internationalized/date'

	import Caption from '$lib/components/pp/caption.svelte'
	import TagIconChip from '$lib/components/pp/tag-icon-chip.svelte'
	import { getSwatch, getIcon } from '$lib/tag-meta'
	import { formatMoney } from '$lib/utils'
	import * as Popover from '$lib/components/ui/popover'
	import { RangeCalendar } from '$lib/components/ui/range-calendar'
	import { Slider } from '$lib/components/ui/slider'

	import SearchIcon from '@lucide/svelte/icons/search'
	import XIcon from '@lucide/svelte/icons/x'
	import CheckIcon from '@lucide/svelte/icons/check'
	import CalendarIcon from '@lucide/svelte/icons/calendar'
	import WalletIcon from '@lucide/svelte/icons/wallet'
	import TagIcon from '@lucide/svelte/icons/tag'
	import RepeatIcon from '@lucide/svelte/icons/repeat'

	import type { DateRange } from 'bits-ui'
	import type { PaymentFilters, SortKey, StatusFilter } from './filters.svelte'
	import type { Tag } from './payments-format'

	type TagStat = Tag & { count: number; spend: number }
	let {
		filters,
		tags,
		meta,
		pendingCount,
		onconfirmAll
	}: {
		filters: PaymentFilters
		tags: Tag[]
		meta: { topTags: TagStat[]; maxAmount: number }
		pendingCount: number
		onconfirmAll: () => void
	} = $props()

	const STATUS_OPTIONS: { key: StatusFilter; label: string }[] = [
		{ key: 'all', label: 'All' },
		{ key: 'pending', label: 'Pending' },
		{ key: 'confirmed', label: 'Confirmed' }
	]

	let tagSearch = $state('')

	const PRIMARY_TAG_COUNT = 6
	const ZERO_STAT = { count: 0, spend: 0 }

	const primaryTags = $derived(selectPrimaryTags(meta.topTags, tags, filters.tagIds))
	const overflowTags = $derived(sortOverflowTags(tags, primaryTags))
	const visibleOverflowTags = $derived(matchTagsByName(overflowTags, tagSearch))

	const MIN_AMOUNT_CEILING = 500
	const amountCeiling = $derived(Math.max(meta.maxAmount, MIN_AMOUNT_CEILING))

	const sliderValue = $derived<[number, number]>([filters.amountMin ?? 0, filters.amountMax ?? amountCeiling])
	function onSliderChange([min, max]: number[]) {
		// A min of 0 or a max at the ceiling means "no bound", so store null instead of the edge value.
		filters.setAmount(min <= 0 ? null : min, max >= amountCeiling ? null : max)
	}
	type AmountSliderBracket = { label: string; min: number | null; max: number | null }
	const amountSliderBrackets: AmountSliderBracket[] = [
		{ label: '< $25', min: null, max: 25 },
		{ label: '$25–100', min: 25, max: 100 },
		{ label: '$100–500', min: 100, max: 500 },
		{ label: '$500+', min: 500, max: null }
	]
	const isBracketActive = (bracket: AmountSliderBracket) =>
		filters.amountMin === bracket.min && filters.amountMax === bracket.max

	function formatAmountLabel(min: number | null, max: number | null): string {
		if (min != null && max != null) return `${formatMoney(min)}–${formatMoney(max)}`
		if (min != null) return `≥ ${formatMoney(min)}`
		if (max != null) return `≤ ${formatMoney(max)}`
		return 'Amount'
	}

	const amountActive = $derived(filters.amountMin != null || filters.amountMax != null)
	const amountLabel = $derived(formatAmountLabel(filters.amountMin, filters.amountMax))

	const dateRangeFormatter = new DateFormatter('en-US', { month: 'short', day: 'numeric' })
	const rangeLabel = $derived(formatRangeLabel(filters.range))

	type DatePreset = { label: string; start: DateValue; end: DateValue }
	const now = today(getLocalTimeZone())
	const lastMonth = now.subtract({ months: 1 })
	const datePresets: DatePreset[] = [
		{ label: 'This month', start: startOfMonth(now), end: endOfMonth(now) },
		{ label: 'Last month', start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) },
		{ label: 'Last 3 months', start: startOfMonth(now.subtract({ months: 2 })), end: endOfMonth(now) },
		{ label: 'Last 6 months', start: startOfMonth(now.subtract({ months: 5 })), end: endOfMonth(now) },
		{ label: 'This year', start: startOfYear(now), end: endOfYear(now) }
	]
	function applyDatePreset(preset: DatePreset) {
		filters.range = { start: preset.start, end: preset.end }
	}
	const isDatePresetActive = (preset: DatePreset) =>
		filters.range.start?.toString() === preset.start.toString() &&
		filters.range.end?.toString() === preset.end.toString()

	// --- sort ---
	const SORT_OPTIONS: { key: SortKey; label: string }[] = [
		{ key: 'date', label: 'Date' },
		{ key: 'amount', label: 'Amount' }
	]

	/** The tags surfaced as chips: top by usage, top by spend, plus any currently selected. */
	function selectPrimaryTags(stats: TagStat[], allTags: Tag[], selectedIds: number[]): Tag[] {
		const topByCount = [...stats].sort((a, b) => b.count - a.count).slice(0, PRIMARY_TAG_COUNT)
		const topBySpend = [...stats].sort((a, b) => b.spend - a.spend).slice(0, PRIMARY_TAG_COUNT)
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const primaryIds = new Set<number>([...topByCount, ...topBySpend].map((s) => s.id))
		// Keep currently-selected tags visible as chips even if they've dropped out of the top lists.
		for (const id of selectedIds) primaryIds.add(id)

		const statById = new Map(stats.map((s) => [s.id, s]))
		const statOf = (id: number) => statById.get(id) ?? ZERO_STAT
		return allTags
			.filter((t) => primaryIds.has(t.id))
			.sort((a, b) => {
				const sa = statOf(a.id)
				const sb = statOf(b.id)
				return sb.count - sa.count || sb.spend - sa.spend || a.name.localeCompare(b.name)
			})
	}

	/** The remaining tags for the "More tags" popover, sorted by name. */
	function sortOverflowTags(allTags: Tag[], primary: Tag[]): Tag[] {
		const primaryIds = new Set(primary.map((t) => t.id))
		return allTags.filter((t) => !primaryIds.has(t.id)).sort((a, b) => a.name.localeCompare(b.name))
	}

	/** Narrow a tag list to those whose name matches the search box. */
	function matchTagsByName(tagList: Tag[], search: string): Tag[] {
		const query = search.trim().toLowerCase()
		return query ? tagList.filter((t) => t.name.toLowerCase().includes(query)) : tagList
	}

	function formatRangeLabel(range: DateRange): string {
		const { start, end } = range
		if (start && end)
			return `${dateRangeFormatter.format(start.toDate('UTC'))} – ${dateRangeFormatter.format(end.toDate('UTC'))}`
		if (start) return `From ${dateRangeFormatter.format(start.toDate('UTC'))}`
		return 'Date range'
	}
</script>

<!-- Clear-X that lives inside a trigger button; a real <button> would nest invalidly, hence the role. -->
{#snippet clearChip(onclear: () => void, label: string)}
	<span
		role="button"
		tabindex="0"
		onclick={(e) => {
			e.stopPropagation()
			onclear()
		}}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.stopPropagation()
				onclear()
			}
		}}
		class="flex text-text-mute hover:text-foreground"
		aria-label={label}
	>
		<XIcon size={13} />
	</span>
{/snippet}

<div class="flex flex-wrap items-center gap-3">
	<div class="flex min-w-[200px] flex-1 items-center gap-2 rounded-full bg-bg-warm px-[14px] py-2">
		<SearchIcon size={14} class="text-text-mute" />
		<input
			bind:value={filters.search}
			placeholder="Search notes, tags…"
			class="flex-1 border-none bg-transparent text-[13.5px] font-medium text-foreground outline-none placeholder:text-text-mute"
		/>
		{#if filters.search}
			<button
				type="button"
				onclick={() => (filters.search = '')}
				class="flex border-none bg-transparent p-0 text-text-mute"
				aria-label="Clear search"
			>
				<XIcon size={13} />
			</button>
		{/if}
	</div>

	<Popover.Root onOpenChange={(open) => !open && filters.commitRange()}>
		<Popover.Trigger>
			{#snippet child({ props })}
				<button
					{...props}
					type="button"
					class="inline-flex items-center gap-2 rounded-full bg-bg-warm px-[14px] py-2 text-[12.5px] font-semibold"
					class:text-foreground={filters.range.start}
					class:text-text-mute={!filters.range.start}
				>
					<CalendarIcon size={13} />
					{rangeLabel}
					{#if filters.range.start || filters.range.end}
						{@render clearChip(() => filters.clearRange(), 'Clear date range')}
					{/if}
				</button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content class="w-auto rounded-2xl border-none bg-card p-2 shadow-xl" align="end">
			<RangeCalendar bind:value={filters.range} numberOfMonths={2} />
			<div class="mt-2 flex flex-wrap gap-2 px-1 pb-1">
				{#each datePresets as preset (preset.label)}
					{@const isActive = isDatePresetActive(preset)}
					<button
						type="button"
						onclick={() => applyDatePreset(preset)}
						class="rounded-full px-3 py-[6px] text-[12.5px] font-semibold"
						class:bg-mint={isActive}
						class:text-foreground={isActive}
						class:bg-bg-warm={!isActive}
						class:text-text-dim={!isActive}
					>
						{preset.label}
					</button>
				{/each}
			</div>
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
						{@render clearChip(() => filters.clearAmount(), 'Clear amount filter')}
					{/if}
				</button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content class="w-[280px] rounded-2xl border-none bg-card p-4 shadow-xl" align="end">
			<Caption class="mb-2.5 block">Quick ranges</Caption>
			<div class="mb-4 flex flex-wrap gap-2">
				{#each amountSliderBrackets as bracket (bracket.label)}
					{@const isActive = isBracketActive(bracket)}
					<button
						type="button"
						onclick={() => filters.setAmount(bracket.min, bracket.max)}
						class="rounded-full px-3 py-[6px] text-[12.5px] font-semibold"
						class:bg-mint={isActive}
						class:text-foreground={isActive}
						class:bg-bg-warm={!isActive}
						class:text-text-dim={!isActive}
					>
						{bracket.label}
					</button>
				{/each}
			</div>

			<Caption class="mb-3 block">Custom</Caption>
			<Slider type="multiple" value={sliderValue} onValueChange={onSliderChange} min={0} max={amountCeiling} step={1} />
			<div class="mt-4 flex items-center gap-2">
				<div class="relative flex flex-1 items-center">
					<span class="absolute left-[12px] font-mono text-[13px] text-text-mute">$</span>
					<input
						inputmode="numeric"
						value={filters.amountMin ?? ''}
						oninput={(e) => {
							const val = e.currentTarget.value.trim()
							filters.amountMin = val === '' ? null : Math.max(0, Math.round(Number(val)))
						}}
						placeholder="Min"
						class="w-full rounded-sm border border-border bg-bg-warm py-[8px] pl-[24px] pr-[10px] font-mono text-[13px] font-medium text-foreground outline-none focus:border-primary"
					/>
				</div>
				<span class="text-text-mute">–</span>
				<div class="relative flex flex-1 items-center">
					<span class="absolute left-[12px] font-mono text-[13px] text-text-mute">$</span>
					<input
						inputmode="numeric"
						value={filters.amountMax ?? ''}
						oninput={(e) => {
							const val = e.currentTarget.value.trim()
							filters.amountMax = val === '' ? null : Math.max(0, Math.round(Number(val)))
						}}
						placeholder="Max"
						class="w-full rounded-sm border border-border bg-bg-warm py-[8px] pl-[24px] pr-[10px] font-mono text-[13px] font-medium text-foreground outline-none focus:border-primary"
					/>
				</div>
			</div>
			{#if amountActive}
				<button
					type="button"
					onclick={() => filters.clearAmount()}
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
			{#each SORT_OPTIONS as { key, label } (key)}
				<button
					type="button"
					onclick={() => filters.setSort(key)}
					class="rounded-full border-none px-[14px] py-1.5 text-[12.5px] font-semibold"
					class:bg-card={filters.sortKey === key}
					class:text-foreground={filters.sortKey === key}
					class:shadow-xs={filters.sortKey === key}
					class:bg-transparent={filters.sortKey !== key}
					class:text-text-mute={filters.sortKey !== key}
				>
					{label}
				</button>
			{/each}
		</div>
	</div>
</div>

<div class="mt-3.5 flex flex-wrap items-center gap-2">
	<Caption class="mr-0.5">Show</Caption>
	<div class="inline-flex gap-1 rounded-full bg-bg-warm p-1">
		{#each STATUS_OPTIONS as { key, label } (key)}
			<button
				type="button"
				onclick={() => (filters.status = key)}
				class="rounded-full border-none px-[14px] py-1.5 text-[12.5px] font-semibold"
				class:bg-card={filters.status === key}
				class:text-foreground={filters.status === key}
				class:shadow-xs={filters.status === key}
				class:bg-transparent={filters.status !== key}
				class:text-text-mute={filters.status !== key}
			>
				{label}
			</button>
		{/each}
	</div>
	<button
		type="button"
		onclick={() => (filters.recurringOnly = !filters.recurringOnly)}
		class="inline-flex items-center gap-1.5 rounded-full px-3 py-[6px] text-[12.5px] font-semibold"
		class:bg-mint={filters.recurringOnly}
		class:text-foreground={filters.recurringOnly}
		class:bg-bg-warm={!filters.recurringOnly}
		class:text-text-mute={!filters.recurringOnly}
	>
		<RepeatIcon size={12} /> Recurring
	</button>
	{#if filters.status === 'pending' && pendingCount > 0}
		<button
			type="button"
			onclick={onconfirmAll}
			class="inline-flex items-center gap-1.5 rounded-full bg-mint px-3 py-[6px] text-[12.5px] font-semibold text-foreground hover:bg-mint-deep"
		>
			<CheckIcon size={13} /> Confirm all ({pendingCount})
		</button>
	{/if}
</div>

<div class="mt-3.5 flex flex-wrap items-center gap-2">
	<Caption class="mr-0.5">Filter</Caption>
	{#each primaryTags as tag (tag.id)}
		{@const isSelected = filters.tagIds.includes(tag.id)}
		{@const swatch = getSwatch(tag.color)}
		{@const Icon = getIcon(tag.icon)}
		<button
			type="button"
			onclick={() => filters.toggleTag(tag.id)}
			class="inline-flex items-center gap-1.5 rounded-full px-3 py-[5px] text-[12.5px] font-semibold"
			style:background={isSelected ? swatch.bg : 'transparent'}
			style:color={isSelected ? swatch.ink : 'var(--text-mute)'}
			style:border={isSelected ? '1px solid transparent' : '1px solid var(--border-color)'}
		>
			<Icon size={12} />
			{tag.name}
		</button>
	{/each}

	{#if overflowTags.length > 0}
		<Popover.Root>
			<Popover.Trigger>
				{#snippet child({ props })}
					<button
						{...props}
						type="button"
						class="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-[5px] text-[12.5px] font-semibold text-text-dim hover:text-foreground"
					>
						<TagIcon size={12} /> More tags
						<span class="text-text-mute">+{overflowTags.length}</span>
					</button>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content class="w-[280px] rounded-2xl border-none bg-card p-2.5 shadow-xl" align="start">
				<div class="mb-2 flex items-center gap-2 rounded-sm bg-bg-warm px-2.5 py-1.5">
					<SearchIcon size={13} class="text-text-mute" />
					<input
						bind:value={tagSearch}
						placeholder="Search tags…"
						class="flex-1 border-none bg-transparent text-[13px] text-foreground outline-none placeholder:text-text-mute"
					/>
				</div>
				<div class="flex max-h-[300px] flex-col gap-0.5 overflow-y-auto">
					{#each visibleOverflowTags as tag (tag.id)}
						{@const isSelected = filters.tagIds.includes(tag.id)}
						<button
							type="button"
							onclick={() => filters.toggleTag(tag.id)}
							class="flex w-full items-center gap-2.5 rounded-sm border-none px-2.5 py-2 text-left text-foreground"
							class:bg-bg-warm={isSelected}
							class:bg-transparent={!isSelected}
						>
							<TagIconChip color={tag.color} icon={tag.icon} size={26} />
							<span class="flex-1 text-[13.5px] font-semibold">{tag.name}</span>
							{#if isSelected}
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

	{#if filters.tagIds.length > 0}
		<button
			type="button"
			onclick={() => filters.clearTags()}
			class="ml-1 border-none bg-transparent text-[12.5px] font-semibold text-lime-text"
		>
			Clear
		</button>
	{/if}
</div>
