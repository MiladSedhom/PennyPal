<script lang="ts">
	import { createColumnHelper, getCoreRowModel, type SortingState, type PaginationState } from '@tanstack/table-core'

	import Caption from '$lib/components/pp/caption.svelte'
	import TagChip from '$lib/components/pp/tag-chip.svelte'
	import { formatMoney } from '$lib/utils'
	import * as Table from '$lib/components/ui/table'
	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table'

	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left'
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right'
	import PencilIcon from '@lucide/svelte/icons/pencil'
	import Trash2Icon from '@lucide/svelte/icons/trash-2'

	import { groupByDay, formatRowDate, type Row, type BodyItem } from './payments-format'
	import type { PaymentFilters } from './filters.svelte'

	let {
		filters,
		pageData,
		pagination = $bindable(),
		onedit,
		ondelete
	}: {
		filters: PaymentFilters
		pageData: { rows: Row[]; total: number; sum: number }
		pagination: PaginationState
		onedit: (row: Row) => void
		ondelete: (row: Row) => void
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
								: header.column.id === 'actions'
									? 'w-[92px]'
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
		{#if bodyItems.length === 0}
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
								<Caption class="font-bold! text-foreground!">{item.label}</Caption>
								<div class="flex-1"></div>
								<Caption>{formatMoney(item.subtotal)}</Caption>
							</div>
						</Table.Cell>
					</Table.Row>
				{:else}
					{@const r = item.row}
					<Table.Row class="group border-border-soft">
						<Table.Cell class="px-6 py-[13px] text-[14.5px] font-semibold tabular-nums">
							{formatMoney(r.amount)}
						</Table.Cell>
						{#if filters.sortKey === 'amount'}
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
						<Table.Cell class="px-6 py-[13px]">
							<span
								class="flex items-center justify-end gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100"
							>
								<button
									type="button"
									onclick={() => onedit(r)}
									class="flex h-7 w-7 items-center justify-center rounded-full border-none bg-transparent text-text-mute hover:bg-bg-warm hover:text-foreground"
									aria-label="Edit payment"
								>
									<PencilIcon size={14} />
								</button>
								<button
									type="button"
									onclick={() => ondelete(r)}
									class="flex h-7 w-7 items-center justify-center rounded-full border-none bg-transparent text-text-mute hover:bg-bg-warm hover:text-(--danger)"
									aria-label="Delete payment"
								>
									<Trash2Icon size={14} />
								</button>
							</span>
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
		<Caption>Page {pageIndex + 1} of {Math.max(table.getPageCount(), 1)}</Caption>
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
		<span class="font-display text-[22px] font-bold tracking-[-0.02em] tabular-nums">{formatMoney(pageData.sum)}</span>
	</div>
</div>
