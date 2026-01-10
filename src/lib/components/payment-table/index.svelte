<script lang="ts">
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down'
	import {
		type ColumnDef,
		type ColumnFiltersState,
		type PaginationState,
		type RowSelectionState,
		type SortingState,
		type VisibilityState,
		getCoreRowModel,
		getFilteredRowModel,
		getPaginationRowModel,
		getSortedRowModel
	} from '@tanstack/table-core'
	import { createRawSnippet } from 'svelte'
	import * as Table from '$lib/components/ui/table/index.js'
	import { Button } from '$lib/components/ui/button/index.js'
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js'
	import { Input } from '$lib/components/ui/input/index.js'
	import { FlexRender, createSvelteTable, renderComponent, renderSnippet } from '$lib/components/ui/data-table/index.js'
	import SortButton from '../ui/data-table/sort-button.svelte'
	import TagsList from './tags-list.svelte'

	type Payment = {
		amount: number
		createdAt: string | Date
		note: string | null
		tags: { id: number; name: string }[]
	}
	interface Props {
		payments: Payment[]
	}

	const { payments }: Props = $props()

	const columns: ColumnDef<Payment>[] = [
		{
			accessorKey: 'amount',
			header: ({ column }) =>
				renderComponent(SortButton, {
					variant: 'ghost',
					onclick: column.getToggleSortingHandler(),
					text: 'Amount',
					isSorted: column.getIsSorted()
				}),
			cell: ({ row }) => {
				const formatter = new Intl.NumberFormat('en-US', {
					style: 'currency',
					currency: 'EGP'
				})

				const amountCellSnippet = createRawSnippet<[{ amount: number }]>((getAmount) => {
					const { amount } = getAmount()
					const formatted = formatter.format(amount)
					return {
						render: () => `
						<div class="flex justify-center items-center">
							<div class="text-start font-medium min-w-20">
							${formatted}
							</div>
						</div>
						`
					}
				})
				return renderSnippet(amountCellSnippet, {
					amount: row.original.amount
				})
			}
		},
		{
			accessorKey: 'createdAt',
			header: ({ column }) =>
				renderComponent(SortButton, {
					variant: 'ghost',
					onclick: column.getToggleSortingHandler(),
					text: 'Date',
					isSorted: column.getIsSorted()
				}),
			cell: ({ row }) => {
				const formatter = new Intl.DateTimeFormat('en-Us', { dateStyle: 'long' })

				const dateCellSnippet = createRawSnippet<[{ date: Date }]>((getProps) => {
					const { date } = getProps()
					return {
						render: () => `
						<div class="flex justify-center items-center">
							<div class="text-start min-w-20">
							${formatter.format(date)}
							</div>
						</div>
						`
					}
				})
				return renderSnippet(dateCellSnippet, {
					date: new Date(row.original.createdAt)
				})
			},
			enableSorting: true,
			enableHiding: true
		},
		{
			accessorKey: 'tags',
			header: ({ column }) =>
				renderComponent(SortButton, {
					variant: 'ghost',
					onclick: column.getToggleSortingHandler(),
					text: 'Tags',
					isSorted: column.getIsSorted()
				}),
			cell: ({ row }) => {
				return renderComponent(TagsList, {
					tags: row.original.tags
				})
			},
			enableSorting: true,
			enableHiding: true
		},
		{
			accessorKey: 'note',
			header: ({ column }) =>
				renderComponent(SortButton, {
					variant: 'ghost',
					onclick: column.getToggleSortingHandler(),
					text: 'Note',
					isSorted: column.getIsSorted()
				}),
			cell: ({ row }) => row.original.note ?? '-',
			enableSorting: true,
			enableHiding: true
		},

		{
			id: 'actions',
			enableHiding: false,
			cell: ({ row }) => ''
		}
	]

	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 })
	let sorting = $state<SortingState>([])
	let columnFilters = $state<ColumnFiltersState>([])
	let rowSelection = $state<RowSelectionState>({})
	let columnVisibility = $state<VisibilityState>({})

	const table = createSvelteTable({
		get data() {
			return payments
		},
		columns,
		state: {
			get pagination() {
				return pagination
			},
			get sorting() {
				return sorting
			},
			get columnVisibility() {
				return columnVisibility
			},
			get rowSelection() {
				return rowSelection
			},
			get columnFilters() {
				return columnFilters
			}
		},
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				pagination = updater(pagination)
			} else {
				pagination = updater
			}
		},
		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				sorting = updater(sorting)
			} else {
				sorting = updater
			}
		},
		onColumnFiltersChange: (updater) => {
			if (typeof updater === 'function') {
				columnFilters = updater(columnFilters)
			} else {
				columnFilters = updater
			}
		},
		onColumnVisibilityChange: (updater) => {
			if (typeof updater === 'function') {
				columnVisibility = updater(columnVisibility)
			} else {
				columnVisibility = updater
			}
		},
		onRowSelectionChange: (updater) => {
			if (typeof updater === 'function') {
				rowSelection = updater(rowSelection)
			} else {
				rowSelection = updater
			}
		}
	})
</script>

<div class="w-full">
	<div class="flex items-center py-4">
		<Input
			placeholder="Search"
			value={(table.getColumn('amount')?.getFilterValue() as string) ?? ''}
			oninput={(e) => table.getColumn('amount')?.setFilterValue(e.currentTarget.value)}
			onchange={(e) => {
				table.getColumn('amount')?.setFilterValue(e.currentTarget.value)
			}}
			class="max-w-sm"
		/>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="outline" class="ms-auto">
						Columns <ChevronDownIcon class="ms-2 size-4" />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				{#each table.getAllColumns().filter((col) => col.getCanHide()) as column (column)}
					<DropdownMenu.CheckboxItem
						class="capitalize"
						bind:checked={() => column.getIsVisible(), (v) => column.toggleVisibility(!!v)}
					>
						{column.id}
					</DropdownMenu.CheckboxItem>
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row>
						{#each headerGroup.headers as header (header.id)}
							<Table.Head class="[&:has([role=checkbox])]:ps-3 wrap-break-words min-w-60 px-4 py-2 whitespace-normal">
								{#if !header.isPlaceholder}
									<FlexRender content={header.column.columnDef.header} context={header.getContext()} />
								{/if}
							</Table.Head>
						{/each}
					</Table.Row>
				{/each}
			</Table.Header>
			<Table.Body>
				{#each table.getRowModel().rows as row (row.id)}
					<Table.Row data-state={row.getIsSelected() && 'selected'}>
						{#each row.getVisibleCells() as cell (cell.id)}
							<Table.Cell
								class="[&:has([role=checkbox])]:ps-3 wrap-break-words h-fit min-w-60 px-4 py-2 whitespace-normal"
							>
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</Table.Cell>
						{/each}
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="h-24 text-center">No results.</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<div class="flex items-center justify-end space-x-2 pt-4">
		<div class="text-muted-foreground flex-1 text-sm">
			{table.getFilteredSelectedRowModel().rows.length} of
			{table.getFilteredRowModel().rows.length} row(s) selected.
		</div>
		<div class="space-x-2">
			<Button variant="outline" size="sm" onclick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
				Previous
			</Button>
			<Button variant="outline" size="sm" onclick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
				Next
			</Button>
		</div>
	</div>
</div>
