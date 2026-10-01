<script lang="ts">
	import { watch } from 'runed'
	import {
		getPaymentsPage,
		getPaymentTagsFilterOptions,
		deletePayment,
		confirmPayment,
		confirmAllPendingPayments
	} from '$lib/remote/payments.remote'
	import { getTags } from '$lib/remote/tags.remote'
	import { dialogs } from '$lib/components/pp/confirm-dialog'
	import { type PaginationState } from '@tanstack/table-core'

	import PaymentsForm from '$lib/components/payments-form.svelte'
	import PaymentEditDialog from '$lib/components/payment-edit-dialog.svelte'
	import { formatMoney } from '$lib/utils'

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
		dateEnd: filters.dateEnd,
		confirmed: filters.status,
		recurringOnly: filters.recurringOnly
	})

	const pageData = $derived(await getPaymentsPage(args))
	const tags = $derived(await getTags())

	// reset to the first page whenever a filter or sort changes (not on page change).
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
		getPaymentTagsFilterOptions().refresh()
	}

	async function confirmRow(r: Row) {
		await confirmPayment(r.id)
		refreshPayments()
	}

	async function confirmAllPending() {
		await confirmAllPendingPayments()
		refreshPayments()
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
</script>

<svelte:head>
	<title>Payments · PennyPal</title>
</svelte:head>

<div class="p-4 md:p-10 md:pt-4">
	<div class="flex items-end justify-between mb-4">
		<div>
			<h1 class="font-display text-xl font-bold tracking-[-0.03em] text-foreground md:text-2xl">Payments</h1>
		</div>
		<div class="flex gap-2.5">
			<PaymentsForm onsaved={refreshPayments} />
		</div>
	</div>

	<div class="mb-4">
		<PaymentsFilterBar
			{filters}
			{tags}
			pendingCount={filters.status === 'pending' ? pageData.total : 0}
			onconfirmAll={confirmAllPending}
		/>
	</div>

	<PaymentsTable
		{filters}
		{pageData}
		bind:pagination
		onedit={(r) => (editing = r)}
		ondelete={confirmDelete}
		onconfirm={confirmRow}
	/>
</div>

<PaymentEditDialog payment={editing} {tags} onclose={() => (editing = null)} onsaved={refreshPayments} />
