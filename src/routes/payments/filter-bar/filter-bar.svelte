<script lang="ts">
	import * as Popover from '#lib/components/ui/popover/index.js'
	import * as Drawer from '#lib/components/ui/drawer/index.js'
	import * as ToggleGroup from '#lib/components/ui/toggle-group/index.js'
	import { Button } from '#lib/components/ui/button/index.js'
	import { getPaymentTagsFilterOptions } from '#lib/remote/payments.remote.js'
	import { getTags } from '#lib/remote/tags.remote.js'

	import SearchIcon from '@lucide/svelte/icons/search'
	import XIcon from '@lucide/svelte/icons/x'
	import CalendarIcon from '@lucide/svelte/icons/calendar'
	import WalletIcon from '@lucide/svelte/icons/wallet'
	import TagIcon from '@lucide/svelte/icons/tag'
	import RepeatIcon from '@lucide/svelte/icons/repeat'
	import ArrowDownUpIcon from '@lucide/svelte/icons/arrow-down-up'
	import SlidersHorizontalIcon from '@lucide/svelte/icons/sliders-horizontal'

	import type { PaymentFilters, RecurringStatusFilter, SortKey } from '../filters.svelte'
	import FilterPill from './filter-pill.svelte'
	import DateFilter, { dateRangeLabel } from './date-filter.svelte'
	import AmountFilter, { amountRangeLabel } from './amount-filter.svelte'
	import TagFilter from './tag-filter.svelte'
	import TagToggle from './tag-toggle.svelte'
	import { rankTags } from './tag-ranking'

	let { filters }: { filters: PaymentFilters } = $props()

	const tags = $derived(await getTags())
	const { recentTags, biggestPayment } = $derived(await getPaymentTagsFilterOptions())
	const rankedTags = $derived(rankTags(recentTags, tags, filters.tagIds))

	const STATUS_OPTIONS: { key: RecurringStatusFilter; label: string }[] = [
		{ key: 'all', label: 'All' },
		{ key: 'pending', label: 'Pending' },
		{ key: 'confirmed', label: 'Confirmed' }
	]
	const statusOptionLabel = $derived(STATUS_OPTIONS.find((o) => o.key === filters.status)?.label ?? 'All')
	const statusLabel = $derived.by(() => {
		if (filters.recurringOnly) return filters.status === 'all' ? 'Recurring only' : `Recurring · ${statusOptionLabel}`
		return filters.status === 'all' ? 'Recurring' : statusOptionLabel
	})

	const SORT_OPTIONS: { key: SortKey; label: string }[] = [
		{ key: 'date', label: 'Date' },
		{ key: 'amount', label: 'Amount' }
	]
	const sortLabel = $derived(SORT_OPTIONS.find((o) => o.key === filters.sortKey)?.label ?? 'Date')
</script>

{#snippet statusOptions()}
	<div class="flex flex-wrap gap-2">
		<ToggleGroup.Root
			type="single"
			aria-label="Status"
			bind:value={() => filters.status, (status) => status && (filters.status = status as RecurringStatusFilter)}
		>
			{#each STATUS_OPTIONS as { key, label } (key)}
				<ToggleGroup.Item value={key}>{label}</ToggleGroup.Item>
			{/each}
		</ToggleGroup.Root>
		<ToggleGroup.Root
			type="multiple"
			aria-label="Recurring"
			bind:value={
				() => (filters.recurringOnly ? ['recurring'] : []), (values) => (filters.recurringOnly = values.length > 0)
			}
		>
			<ToggleGroup.Item value="recurring"><RepeatIcon /> Recurring only</ToggleGroup.Item>
		</ToggleGroup.Root>
	</div>
{/snippet}

{#snippet sortOptions()}
	<ToggleGroup.Root
		type="single"
		aria-label="Sort by"
		bind:value={() => filters.sortKey, (key) => key && filters.setSort(key as SortKey)}
	>
		{#each SORT_OPTIONS as { key, label } (key)}
			<ToggleGroup.Item value={key}>{label}</ToggleGroup.Item>
		{/each}
	</ToggleGroup.Root>
{/snippet}

<div class="flex flex-wrap items-center gap-3">
	<div class="flex min-w-[200px] flex-1 items-center gap-2 rounded-full bg-muted px-[14px] py-2">
		<SearchIcon size={14} class="text-faint" />
		<input
			bind:value={filters.search}
			aria-label="Search payments"
			placeholder="Search notes, tags…"
			class="flex-1 border-none bg-transparent text-[13.5px] font-medium text-foreground outline-none placeholder:text-faint"
		/>
		{#if filters.search}
			<Button
				variant="ghost"
				size="icon-sm"
				onclick={() => (filters.search = '')}
				class="size-5 rounded-full text-faint hover:bg-transparent hover:text-foreground dark:hover:bg-transparent"
				aria-label="Clear search"
			>
				<XIcon class="size-3.5" />
			</Button>
		{/if}
	</div>

	<div class="hidden md:contents">
		<FilterPill
			icon={CalendarIcon}
			label={dateRangeLabel(filters.dateRange)}
			active={filters.isDateRangeActive}
			onclear={filters.clearDateRange}
			contentClass="w-auto p-2"
		>
			<DateFilter {filters} months={2} />
		</FilterPill>
		<FilterPill
			icon={WalletIcon}
			label={amountRangeLabel(filters.amountRange)}
			active={filters.isAmountActive}
			onclear={filters.clearAmount}
			contentClass="w-[280px] p-4"
		>
			<AmountFilter {filters} largestPayment={biggestPayment} />
		</FilterPill>
		<FilterPill
			icon={RepeatIcon}
			label={statusLabel}
			active={filters.isStatusActive}
			onclear={filters.clearStatus}
			contentClass="w-auto p-3"
		>
			{@render statusOptions()}
		</FilterPill>
		<FilterPill icon={ArrowDownUpIcon} label="Sort: {sortLabel}" active contentClass="w-auto p-3">
			{@render sortOptions()}
		</FilterPill>
	</div>

	<Drawer.Root>
		<Drawer.Trigger>
			{#snippet child({ props })}
				<Button
					{...props}
					variant="secondary"
					size="sm"
					class={[
						'rounded-full text-[12.5px] font-semibold md:hidden',
						filters.activeCount > 0 ? 'text-foreground' : 'text-muted-foreground'
					]}
				>
					<SlidersHorizontalIcon class="size-3.5" />
					Filters
					{#if filters.activeCount > 0}
						<span
							class="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground [text-box:trim-both_cap_alphabetic]"
						>
							{filters.activeCount}
						</span>
					{/if}
				</Button>
			{/snippet}
		</Drawer.Trigger>
		<Drawer.Content>
			<Drawer.Header>
				<Drawer.Title>Filters</Drawer.Title>
			</Drawer.Header>
			<div class="flex min-h-0 flex-col gap-6 overflow-y-auto px-4 pb-2">
				<section>
					<span class="caption mb-2.5 block">Sort by</span>
					{@render sortOptions()}
				</section>
				<section data-vaul-no-drag>
					<span class="caption mb-2.5 block">Date</span>
					<DateFilter {filters} calendarClass="mx-auto w-fit p-0 [--cell-size:--spacing(11)]" />
				</section>
				<section data-vaul-no-drag>
					<span class="caption mb-2.5 block">Amount</span>
					<AmountFilter {filters} largestPayment={biggestPayment} />
				</section>
				<section>
					<span class="caption mb-2.5 block">Status</span>
					{@render statusOptions()}
				</section>
				<section>
					<span class="caption mb-2.5 block">Tags</span>
					<TagFilter {filters} tags={[...rankedTags.primary, ...rankedTags.overflow]} />
				</section>
			</div>
			<Drawer.Footer class="flex-row gap-2 border-t border-border">
				<Button variant="secondary" onclick={filters.clearAll} class="flex-1 rounded-full">Clear all</Button>
				<Drawer.Close>
					{#snippet child({ props })}
						<Button {...props} class="flex-1 rounded-full">Show results</Button>
					{/snippet}
				</Drawer.Close>
			</Drawer.Footer>
		</Drawer.Content>
	</Drawer.Root>
</div>

<div class="mt-3.5 hidden flex-wrap items-center gap-2 md:flex">
	<ToggleGroup.Root
		type="multiple"
		aria-label="Top tags"
		bind:value={() => filters.tagIds.map(String), (ids) => (filters.tagIds = ids.map(Number))}
	>
		{#each rankedTags.primary as tag (tag.id)}
			<TagToggle {tag} />
		{/each}
	</ToggleGroup.Root>

	{#if rankedTags.overflow.length > 0}
		<Popover.Root>
			<Popover.Trigger>
				{#snippet child({ props })}
					<Button
						{...props}
						variant="outline"
						size="sm"
						class="h-7 rounded-full text-[12.5px] font-semibold text-muted-foreground hover:text-foreground"
					>
						<TagIcon class="size-3" /> More tags
						<span class="text-faint">+{rankedTags.overflow.length}</span>
					</Button>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content
				class="max-h-96 w-[300px] overflow-y-auto rounded-2xl border-none bg-card p-3 shadow-xl"
				align="start"
			>
				<TagFilter {filters} tags={rankedTags.overflow} />
			</Popover.Content>
		</Popover.Root>
	{/if}

	{#if filters.tagIds.length > 0}
		<Button
			variant="link"
			size="sm"
			onclick={filters.clearTags}
			class="ml-1 h-7 px-1 text-[12.5px] font-semibold text-kit-navy"
		>
			Clear
		</Button>
	{/if}
</div>
