<script lang="ts">
	import { createColumnHelper, getCoreRowModel, type SortingState, type PaginationState } from '@tanstack/table-core'

	import TagChip from '#lib/components/pp/tag-chip.svelte'
	import { formatMoney } from '#lib/utils/index.js'
	import * as Table from '#lib/components/ui/table/index.js'
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js'
	import { Button } from '#lib/components/ui/button/index.js'
	import { createSvelteTable, FlexRender } from '#lib/components/ui/data-table/index.js'

	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left'
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right'
	import PencilIcon from '@lucide/svelte/icons/pencil'
	import Trash2Icon from '@lucide/svelte/icons/trash-2'
	import RepeatIcon from '@lucide/svelte/icons/repeat'
	import CheckIcon from '@lucide/svelte/icons/check'
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis'

	import { groupByDay, formatRowDate, type Row, type BodyItem } from './payments-format'
	import type { PaymentFilters } from './filters.svelte'

	let {
		filters,
		pageData,
		pagination = $bindable(),
		onedit,
		ondelete,
		onconfirm
	}: {
		filters: PaymentFilters
		pageData: { rows: Row[]; total: number; sum: number }
		pagination: PaginationState
		onedit: (row: Row) => void
		ondelete: (row: Row) => void
		onconfirm: (row: Row) => void
	} = $props()

	const columnHelper = createColumnHelper<Row>()
	const columns = $derived([
		columnHelper.accessor('amount', { id: 'amount', header: 'Amount', enableSorting: true }),
		...(filters.sortKey === 'amount'
			? [columnHelper.accessor('createdAt', { id: 'date', header: 'Date', enableSorting: false })]
			: []),
		columnHelper.display({ id: 'tags', header: 'Tags', enableSorting: false }),
		columnHelper.display({ id: 'note', header: 'Note', enableSorting: false }),
		columnHelper.display({ id: 'actions', header: '', enableSorting: false })
	])
	const sorting = $derived<SortingState>([{ id: filters.sortKey, desc: filters.sortDir === 'desc' }])

	const table = createSvelteTable({
		get data() {
			return pageData.rows
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
			const next = typeof updater === 'function' ? updater(sorting) : updater
			const s = next[0]
			if (s) {
				filters.sortKey = s.id === 'amount' ? 'amount' : 'date'
				filters.sortDir = s.desc ? 'desc' : 'asc'
			}
		},
		onPaginationChange: (updater) => {
			pagination = typeof updater === 'function' ? updater(pagination) : updater
		}
	})

	const bodyItems = $derived<BodyItem[]>(
		filters.sortKey === 'date' ? groupByDay(pageData.rows) : pageData.rows.map((row) => ({ kind: 'row', row }))
	)

	const colCount = $derived(table.getVisibleLeafColumns().length)
	const pageIndex = $derived(table.getState().pagination.pageIndex)
</script>

<div class="overflow-hidden rounded-card border border-border bg-card">
	<div class="hidden md:block">
		<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row class="border-border hover:bg-transparent">
						{#each headerGroup.headers as header (header.id)}
							<Table.Head
								class="px-6 py-3 {header.column.id === 'amount'
									? 'w-[130px]'
									: header.column.id === 'date'
										? 'w-[150px]'
										: header.column.id === 'actions'
											? 'w-[92px]'
											: ''}"
							>
								<span class="font-mono text-xs font-semibold uppercase tracking-[0.04em] text-faint">
									<FlexRender content={header.column.columnDef.header} context={header.getContext()} />
								</span>
							</Table.Head>
						{/each}
					</Table.Row>
				{/each}
			</Table.Header>

			<Table.Body>
				{#if bodyItems.length === 0}
					<Table.Row class="hover:bg-transparent">
						<Table.Cell colspan={colCount} class="px-6 py-12 text-center text-sm text-faint">
							No payments match your filters.
						</Table.Cell>
					</Table.Row>
				{:else}
					{#each bodyItems as item, i (item.kind === 'row' ? `r${item.row.id}` : `d${i}`)}
						{#if item.kind === 'divider'}
							<Table.Row class="border-border bg-muted hover:bg-muted">
								<Table.Cell colspan={colCount} class="px-6 py-2.5">
									<div class="flex items-center gap-3">
										<span class="caption font-bold! text-foreground!">{item.label}</span>
										<div class="flex-1"></div>
										<span class="caption text-foreground!">{formatMoney(item.subtotal)}</span>
									</div>
								</Table.Cell>
							</Table.Row>
						{:else}
							{@const r = item.row}
							<Table.Row class="group border-border {r.confirmed ? '' : 'bg-warn/5 hover:bg-warn/10'}">
								<Table.Cell class="px-6 py-4 text-base font-semibold tabular-nums">
									{formatMoney(r.amount)}
								</Table.Cell>
								{#if filters.sortKey === 'amount'}
									<Table.Cell class="px-6 py-4 text-sm text-muted-foreground tabular-nums">
										{formatRowDate(r.createdAt)}
									</Table.Cell>
								{/if}
								<Table.Cell class="px-6 py-4">
									<span class="flex flex-wrap gap-1.5">
										{#if r.tags.length > 0}
											{#each r.tags as tag (tag.id)}
												<TagChip name={tag.name} color={tag.color} icon={tag.icon} size="sm" />
											{/each}
										{:else}
											<span class="text-xs text-faint">Untagged</span>
										{/if}
									</span>
								</Table.Cell>
								<Table.Cell class="px-6 py-[13px] text-[13px] {r.note ? 'text-muted-foreground' : 'text-faint'}">
									<span class="inline-flex items-center gap-1.5">
										{#if r.recurringPaymentId}
											<span
												class="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-muted text-foreground"
												title="Created by a recurring payment"
											>
												<RepeatIcon size={12} />
											</span>
										{/if}
										{r.note || '—'}
									</span>
								</Table.Cell>
								<Table.Cell class="px-6 py-[13px]">
									<span class="flex items-center justify-end gap-0.5">
										{#if !r.confirmed}
											<Button
												variant="secondary"
												size="sm"
												onclick={() => onconfirm(r)}
												class="mr-1 h-7 rounded-full px-2.5 text-[11.5px] font-semibold hover:bg-foreground/10"
											>
												<CheckIcon class="size-3" /> Confirm
											</Button>
										{/if}
										<span
											class="flex items-center gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100"
										>
											<Button
												variant="ghost"
												size="icon-sm"
												onclick={() => onedit(r)}
												class="size-7 rounded-full text-faint hover:text-foreground"
												aria-label="Edit payment"
											>
												<PencilIcon class="size-3.5" />
											</Button>
											<Button
												variant="ghost"
												size="icon-sm"
												onclick={() => ondelete(r)}
												class="size-7 rounded-full text-faint hover:text-destructive"
												aria-label="Delete payment"
											>
												<Trash2Icon class="size-3.5" />
											</Button>
										</span>
									</span>
								</Table.Cell>
							</Table.Row>
						{/if}
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>

	<ul class="md:hidden">
		{#if bodyItems.length === 0}
			<li class="px-4 py-12 text-center text-sm text-faint">No payments match your filters.</li>
		{:else}
			{#each bodyItems as item, i (item.kind === 'row' ? `r${item.row.id}` : `d${i}`)}
				{#if item.kind === 'divider'}
					<li class="flex items-center justify-between gap-3 border-b border-border bg-muted px-4 py-2.5">
						<span class="caption font-bold! text-foreground!">{item.label}</span>
						<span class="caption text-foreground!">{formatMoney(item.subtotal)}</span>
					</li>
				{:else}
					{@const r = item.row}
					<li class={['flex items-start gap-3 border-b border-border px-4 py-3', !r.confirmed && 'bg-warn/5']}>
						<div class="flex min-w-0 flex-1 flex-col gap-2">
							<div class="flex items-baseline gap-2">
								<span class="text-base font-semibold tabular-nums">{formatMoney(r.amount)}</span>
								{#if r.recurringPaymentId}
									<RepeatIcon
										class="size-3 shrink-0 self-center text-muted-foreground"
										aria-label="Created by a recurring payment"
									/>
								{/if}
								{#if filters.sortKey === 'amount'}
									<span class="text-xs text-muted-foreground tabular-nums">{formatRowDate(r.createdAt)}</span>
								{/if}
							</div>
							{#if r.tags.length > 0}
								<span class="flex flex-wrap gap-1.5">
									{#each r.tags as tag (tag.id)}
										<TagChip name={tag.name} color={tag.color} icon={tag.icon} size="sm" />
									{/each}
								</span>
							{/if}
							{#if r.note}
								<span class="min-w-0 break-words text-[13px] text-muted-foreground">{r.note}</span>
							{/if}
						</div>
						<div class="flex shrink-0 items-center gap-1">
							{#if !r.confirmed}
								<Button
									variant="secondary"
									size="sm"
									onclick={() => onconfirm(r)}
									class="h-7 rounded-full px-2.5 text-[11.5px] font-semibold"
								>
									<CheckIcon class="size-3" /> Confirm
								</Button>
							{/if}
							<DropdownMenu.Root>
								<DropdownMenu.Trigger>
									{#snippet child({ props })}
										<Button
											{...props}
											variant="ghost"
											size="icon-sm"
											class="rounded-full text-faint hover:text-foreground"
											aria-label="Payment actions"
										>
											<EllipsisIcon class="size-4" />
										</Button>
									{/snippet}
								</DropdownMenu.Trigger>
								<DropdownMenu.Content align="end">
									<DropdownMenu.Item onSelect={() => onedit(r)}>
										<PencilIcon /> Edit
									</DropdownMenu.Item>
									<DropdownMenu.Item variant="destructive" onSelect={() => ondelete(r)}>
										<Trash2Icon /> Delete
									</DropdownMenu.Item>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						</div>
					</li>
				{/if}
			{/each}
		{/if}
	</ul>

	<div class="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-4 md:px-6">
		<div class="flex items-center gap-3">
			<Button
				variant="outline"
				size="icon-sm"
				onclick={() => table.previousPage()}
				disabled={!table.getCanPreviousPage()}
				class="rounded-full text-muted-foreground"
				aria-label="Previous page"
			>
				<ChevronLeftIcon />
			</Button>
			<span class="caption">Page {pageIndex + 1} of {Math.max(table.getPageCount(), 1)}</span>
			<Button
				variant="outline"
				size="icon-sm"
				onclick={() => table.nextPage()}
				disabled={!table.getCanNextPage()}
				class="rounded-full text-muted-foreground"
				aria-label="Next page"
			>
				<ChevronRightIcon />
			</Button>
			<span class="caption ml-1">{pageData.total} total</span>
		</div>
		<div class="flex items-baseline gap-2.5">
			<span class="caption">Total</span>
			<span class="font-display text-[22px] font-bold tracking-[-0.02em] tabular-nums">{formatMoney(pageData.sum)}</span
			>
		</div>
	</div>
</div>
