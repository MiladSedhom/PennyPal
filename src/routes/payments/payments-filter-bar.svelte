<script lang="ts">
	import { SvelteMap, SvelteSet } from 'svelte/reactivity'
	import { DateFormatter } from '@internationalized/date'

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

	import type { PaymentFilters } from './filters.svelte'
	import type { Tag } from './payments-format'

	type TagStat = Tag & { count: number; spend: number }
	let {
		filters,
		tags,
		meta
	}: {
		filters: PaymentFilters
		tags: Tag[]
		meta: { topTags: TagStat[]; maxAmount: number }
	} = $props()

	let tagSearch = $state('')

	// --- relevant tag chips (45-day window from server meta) ---
	const statById = $derived(new SvelteMap(meta.topTags.map((t) => [t.id, { count: t.count, spend: t.spend }])))
	const primaryTags = $derived.by(() => {
		const byCount = [...meta.topTags].sort((a, b) => b.count - a.count).slice(0, 6)
		const bySpend = [...meta.topTags].sort((a, b) => b.spend - a.spend).slice(0, 6)
		const ids = new SvelteSet<number>([...byCount, ...bySpend].map((t) => t.id))
		for (const id of filters.tagIds) ids.add(id)
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
	const sliderValue = $derived<[number, number]>([filters.amountMin ?? 0, filters.amountMax ?? amountCeil])
	function setSlider(v: number[]) {
		const [lo, hi] = v
		filters.setAmount(lo <= 0 ? null : lo, hi >= amountCeil ? null : hi)
	}
	type Bracket = { label: string; min: number | null; max: number | null }
	const brackets: Bracket[] = [
		{ label: '< $25', min: null, max: 25 },
		{ label: '$25–100', min: 25, max: 100 },
		{ label: '$100–500', min: 100, max: 500 },
		{ label: '$500+', min: 500, max: null }
	]
	const bracketActive = (b: Bracket) => filters.amountMin === b.min && filters.amountMax === b.max

	const amountActive = $derived(filters.amountMin != null || filters.amountMax != null)
	const amountLabel = $derived.by(() => {
		const { amountMin, amountMax } = filters
		if (amountMin != null && amountMax != null) return `${formatMoney(amountMin)}–${formatMoney(amountMax)}`
		if (amountMin != null) return `≥ ${formatMoney(amountMin)}`
		if (amountMax != null) return `≤ ${formatMoney(amountMax)}`
		return 'Amount'
	})

	// --- date range ---
	const rangeDf = new DateFormatter('en-US', { month: 'short', day: 'numeric' })
	const rangeLabel = $derived.by(() => {
		const { start, end } = filters.range
		if (start && end) return `${rangeDf.format(start.toDate('UTC'))} – ${rangeDf.format(end.toDate('UTC'))}`
		if (start) return `From ${rangeDf.format(start.toDate('UTC'))}`
		return 'Date range'
	})
</script>

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

	<!-- Date range -->
	<Popover.Root>
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
						<span
							role="button"
							tabindex="0"
							onclick={(e) => {
								e.stopPropagation()
								filters.clearRange()
							}}
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.stopPropagation()
									filters.clearRange()
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
			<RangeCalendar bind:value={filters.range} numberOfMonths={2} />
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
								filters.clearAmount()
							}}
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.stopPropagation()
									filters.clearAmount()
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
						onclick={() => filters.setAmount(b.min, b.max)}
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
			{#each [['date', 'Date'], ['amount', 'Amount']] as const as [k, lbl] (k)}
				<button
					type="button"
					onclick={() => filters.setSort(k)}
					class="rounded-full border-none px-[14px] py-1.5 text-[12.5px] font-semibold"
					class:bg-card={filters.sortKey === k}
					class:text-foreground={filters.sortKey === k}
					class:shadow-xs={filters.sortKey === k}
					class:bg-transparent={filters.sortKey !== k}
					class:text-text-mute={filters.sortKey !== k}
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
		{@const on = filters.tagIds.includes(t.id)}
		{@const c = getSwatch(t.color)}
		{@const Icon = getIcon(t.icon)}
		<button
			type="button"
			onclick={() => filters.toggleTag(t.id)}
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
				<div class="mb-2 flex items-center gap-2 rounded-sm bg-bg-warm px-2.5 py-1.5">
					<SearchIcon size={13} class="text-text-mute" />
					<input
						bind:value={tagSearch}
						placeholder="Search tags…"
						class="flex-1 border-none bg-transparent text-[13px] text-foreground outline-none placeholder:text-text-mute"
					/>
				</div>
				<div class="flex max-h-[300px] flex-col gap-0.5 overflow-y-auto">
					{#each overflowTags as t (t.id)}
						{@const on = filters.tagIds.includes(t.id)}
						<button
							type="button"
							onclick={() => filters.toggleTag(t.id)}
							class="flex w-full items-center gap-2.5 rounded-sm border-none px-2.5 py-2 text-left text-foreground"
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
