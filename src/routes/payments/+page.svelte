<script lang="ts">
	import { watch } from 'runed'
	import { getPaymentsPage, getPaymentsMeta, deletePayment } from '$lib/remote/payments.remote'
	import { getTags } from '$lib/remote/tags.remote'
	import { dialogs } from '$lib/components/pp/confirm-dialog'
	import { type PaginationState } from '@tanstack/table-core'

	import PaymentsForm from '$lib/components/payments-form.svelte'
	import PaymentEditDialog from '$lib/components/payment-edit-dialog.svelte'
	import Card from '$lib/components/pp/card.svelte'
	import Caption from '$lib/components/pp/caption.svelte'
	import { Button } from '$lib/components/ui/button'
	import { formatMoney } from '$lib/utils'
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right'

	import { PaymentFilters } from './filters.svelte'
	import { formatRowDate, type Row } from './payments-format'
	import PaymentsFilterBar from './payments-filter-bar.svelte'
	import PaymentsTable from './payments-table.svelte'

	const filters = new PaymentFilters()
	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 25 })

	const args = $derived({
		page: pagination.pageIndex,
		pageSize: pagination.pageSize,
		sort: filters.sortKey,
		dir: filters.sortDir,
		search: filters.debouncedSearch,
		tagIds: filters.tagIds,
		amountMin: filters.debouncedAmount.min,
		amountMax: filters.debouncedAmount.max,
		dateStart: filters.dateStart,
		dateEnd: filters.dateEnd
	})

	const pageData = $derived(await getPaymentsPage(args))
	const meta = $derived(await getPaymentsMeta())
	const tags = $derived(await getTags())

	// Reset to the first page whenever a filter or sort changes (not on page change).
	watch(
		() => filters.snapshot,
		() => {
			pagination.pageIndex = 0
		}
	)

	// row actions
	let editing = $state<Row | null>(null)

	function refreshPayments() {
		getPaymentsPage(args).refresh()
		getPaymentsMeta().refresh()
	}

	function confirmDelete(r: Row) {
		dialogs.danger(
			async () => {
				// Deleting the last row of a non-first page steps back so the user isn't left on an empty page.
				const willEmptyPage = pageData.rows.length === 1 && pagination.pageIndex > 0
				await deletePayment(r.id)
				if (willEmptyPage) pagination.pageIndex -= 1
				refreshPayments()
			},
			{
				title: 'Delete this payment?',
				message: `${formatMoney(r.amount)} on ${formatRowDate(r.createdAt)}${r.note ? ` — “${r.note}”` : ''}. This can't be undone.`,
				confirmText: 'Delete payment'
			}
		)
	}

	const monthLabel = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })
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
			<PaymentsForm onsaved={refreshPayments} />
		</div>
	</div>

	<Card pad="md" class="mb-4">
		<PaymentsFilterBar {filters} {tags} {meta} />
	</Card>

	<Card pad="none" class="overflow-hidden">
		<PaymentsTable {filters} {pageData} bind:pagination onedit={(r) => (editing = r)} ondelete={confirmDelete} />
	</Card>
</div>

<PaymentEditDialog payment={editing} {tags} onclose={() => (editing = null)} onsaved={refreshPayments} />
