<script lang="ts">
	import { Button } from '$lib/components/ui/button'
	import { createPayments, getPayments } from '$lib/remote/payments.remote'
	import { getTags } from '$lib/remote/tags.remote'
	import XIcon from '@lucide/svelte/icons/x'
	import PlusIcon from '@lucide/svelte/icons/plus'
	import CheckIcon from '@lucide/svelte/icons/check'
	import LoaderIcon from '@lucide/svelte/icons/loader-circle'
	import DatePicker from '$lib/components/ui/date-picker/date-picker.svelte'
	import { tick } from 'svelte'
	import { type DateValue, getLocalTimeZone, today } from '@internationalized/date'
	import * as Dialog from '$lib/components/ui/dialog'
	import * as Kbd from '$lib/components/ui/kbd/index.js'
	import TagMultiSelect from '$lib/components/pp/tag-multiselect.svelte'
	import { formatMoney } from '$lib/utils/index'

	const { onsaved }: { onsaved?: () => void } = $props()

	let open = $state(false)

	type PaymentRow = { amount: number; tags: number[]; note: string; date: DateValue }

	const blankPayment = (): PaymentRow => ({
		amount: 0,
		tags: [],
		note: '',
		date: today(getLocalTimeZone())
	})
	const paymentsForms = $state<PaymentRow[]>([blankPayment()])

	const refs = $state<Record<keyof PaymentRow, (HTMLInputElement | null)[]>>({
		amount: [null],
		tags: [null],
		date: [null],
		note: [null]
	})

	const tags = $derived(await getTags())

	const isPaymentComplete = (p: PaymentRow) => p.amount > 0 && p.date
	const completeRows = $derived(paymentsForms.filter(isPaymentComplete))
	const completeAmountTotal = $derived(completeRows.reduce((a, r) => a + r.amount, 0))

	async function focusDate(index: number) {
		await tick()
		refs.date[index]?.focus()
	}

	function addRow() {
		const lastDate = paymentsForms.at(-1)?.date ?? today(getLocalTimeZone())
		paymentsForms.push({ amount: 0, tags: [], note: '', date: lastDate })

		for (const key in refs) refs[key as keyof typeof refs].push(null)

		focusDate(paymentsForms.length - 1)
	}

	function removeRow(index: number) {
		if (paymentsForms.length <= 1) return
		paymentsForms.splice(index, 1)
		for (const key in refs) refs[key as keyof typeof refs].splice(index, 1)
	}

	function addRowOnTab(e: KeyboardEvent, index: number) {
		if (e.key === 'Tab' && !e.shiftKey && index === paymentsForms.length - 1) {
			e.preventDefault()
			addRow()
		}
	}

	function noteKeydown(e: KeyboardEvent, index: number, hasTrailingButton: boolean) {
		if (!hasTrailingButton) addRowOnTab(e, index)
		// Backspace on an empty note steps focus back to the tags field.
		if (e.key === 'Backspace' && paymentsForms[index].note === '') {
			e.preventDefault()
			refs.tags[index]?.focus()
		}
	}

	// Backspace on an empty amount deletes the whole row
	function amountKeydown(e: KeyboardEvent, index: number) {
		if (e.key === 'Backspace' && (!paymentsForms[index].amount || paymentsForms[index].amount === 0)) {
			if (index === 0) return // never delete the first row
			e.preventDefault()
			const prev = index - 1
			removeRow(index)
			queueMicrotask(() => refs.amount[prev]?.focus())
		}
	}

	async function saveAllCompleted() {
		if (createPayments.pending > 0 || completeRows.length === 0) return
		await createPayments({
			payments: completeRows.map((pf) => ({
				amount: pf.amount,
				note: pf.note,
				tags: pf.tags,
				date: pf.date.toDate(getLocalTimeZone())
			}))
		}).updates(getPayments())
		paymentsForms.splice(0, paymentsForms.length, blankPayment())
		for (const key in refs) refs[key as keyof typeof refs].splice(0, refs[key as keyof typeof refs].length, null)
		open = false
		onsaved?.()
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'n' && e.altKey) {
			open = !open
			e.preventDefault()
			return
		}
		// Ctrl/⌘+Enter commits every complete row, from anywhere in the dialog.
		if (open && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
			e.preventDefault()
			saveAllCompleted()
		}
	}}
/>

<Button type="button" onclick={() => (open = true)}>
	<PlusIcon size={15} /> Add Payments
</Button>

<Dialog.Root bind:open>
	<Dialog.Content
		class="max-w-[1100px]! w-3/4 gap-0 rounded-2xl border-none bg-card p-0 shadow-2xl sm:max-w-[1100px]!"
		showCloseButton={false}
		onOpenAutoFocus={(e) => {
			e.preventDefault()
			focusDate(0)
		}}
	>
		<div class="flex items-center justify-between border-b border-border-soft p-4">
			<div class="flex items-baseline gap-3">
				<Dialog.Title class="m-0 font-display text-[22px] font-bold tracking-[-0.025em]">Add Payments</Dialog.Title>
			</div>
			<div class="flex items-center gap-3">
				<span class="hidden items-center gap-4 text-[12px] text-text-mute sm:inline-flex">
					<span><Kbd.Root class="px-2">Tab</Kbd.Root> add row</span>
					<span><Kbd.Root class="px-2">⌫</Kbd.Root> remove</span>
					<span><Kbd.Root class="px-2">⌘ + ↵</Kbd.Root> save</span>
				</span>
				<Button
					variant="secondary"
					size="icon-sm"
					onclick={() => (open = false)}
					class="rounded-full text-text-dim hover:text-foreground"
					aria-label="Close"
				>
					<XIcon />
				</Button>
			</div>
		</div>

		<div
			class="grid items-center gap-3 border-b border-border-soft bg-bg-warm px-7 py-3"
			style:grid-template-columns="32px 190px 130px 1.4fr 1fr 32px"
		>
			<span></span>
			<span class="font-mono text-xs font-semibold uppercase tracking-[0.04em] text-text-mute text-center">Date</span>
			<span class="font-mono text-xs font-semibold uppercase tracking-[0.04em] text-text-mute text-center">Amount</span>
			<span class="font-mono text-xs font-semibold uppercase tracking-[0.04em] text-text-mute text-center">Tags</span>
			<span class="font-mono text-xs font-semibold uppercase tracking-[0.04em] text-text-mute text-center">Note</span>
			<span></span>
		</div>

		<div class="max-h-[55vh] h-[35vh] overflow-y-auto">
			{#each paymentsForms as p, index (index)}
				<div
					class="grid items-center gap-3 border-b border-border-soft px-7 py-2"
					style:grid-template-columns="32px 190px 130px 1.4fr 1fr 32px"
				>
					<span class="text-center font-mono text-[11px] tracking-[0.04em] text-text-mute">
						{String(index + 1).padStart(2, '0')}
					</span>

					<DatePicker
						bind:value={p.date}
						bind:ref={refs.date[index]}
						class="w-full rounded-sm! border-transparent bg-transparent! px-2.5! hover:bg-bg-warm!"
						title={p.date.toString()}
					/>

					<input
						type="number"
						bind:value={p.amount}
						bind:this={refs.amount[index]}
						placeholder="0"
						step="1"
						min="0"
						onkeydown={(e) => amountKeydown(e, index)}
						class="w-full rounded-sm border border-transparent bg-transparent px-2.5 py-2 text-right font-mono text-[13.5px] font-medium text-foreground hover:bg-bg-warm"
					/>

					<TagMultiSelect
						{tags}
						bind:selected={p.tags}
						bind:trigger={refs.tags[index]}
						triggerProps={{
							onkeydown: (e) => {
								if (e.key === 'Backspace') refs.amount[index]?.focus()
							}
						}}
					/>

					<input
						bind:value={p.note}
						bind:this={refs.note[index]}
						placeholder="—"
						onkeydown={(e) => noteKeydown(e, index, paymentsForms.length > 1)}
						class="w-full rounded-sm border border-transparent bg-transparent px-2.5 py-2 text-[13.5px] text-foreground hover:bg-bg-warm"
					/>

					<span class="flex items-center justify-center">
						{#if paymentsForms.length > 1}
							<Button
								variant="ghost"
								size="icon-sm"
								onclick={() => removeRow(index)}
								onkeydown={(e) => addRowOnTab(e, index)}
								class="size-6 rounded-full text-text-mute hover:text-foreground"
								aria-label="Remove row"
							>
								<XIcon class="size-3.5" />
							</Button>
						{/if}
					</span>
				</div>
			{/each}

			<div class="px-7 pb-4 pt-3">
				<Button
					variant="secondary"
					size="sm"
					onclick={addRow}
					class="rounded-full text-[12.5px] font-semibold text-text-dim hover:text-foreground"
				>
					<PlusIcon class="size-3.5" />
					Add Another Payment
				</Button>
			</div>
		</div>

		<!-- Sticky commit bar -->
		<div class="flex justify-center px-7 pb-5 pt-2">
			<div
				class="flex w-full max-w-[1000px] items-center gap-5 rounded-full bg-foreground/85 px-6 py-3 text-background shadow-xl"
			>
				<div class="flex items-baseline gap-2">
					<span class="font-display text-[22px] font-bold tracking-[-0.02em] text-background">
						{formatMoney(completeAmountTotal)}
					</span>
					<span class="text-[13px] text-background/60">
						{completeRows.length} payment{completeRows.length === 1 ? '' : 's'} ready to be saved
					</span>
				</div>
				<div class="flex-1"></div>
				<Button
					variant="ghost"
					onclick={() => (open = false)}
					class="h-[36px] rounded-full px-3 text-[13.5px] font-semibold text-background/70 hover:bg-background/10 hover:text-background dark:hover:bg-background/10"
				>
					Cancel
				</Button>
				<Button
					type="button"
					class="h-[36px] gap-2 rounded-full px-[18px] text-[13.5px] font-semibold"
					disabled={completeRows.length === 0 || createPayments.pending > 0}
					onclick={saveAllCompleted}
				>
					{#if createPayments.pending > 0}
						<LoaderIcon size={15} class="animate-spin" />
						Saving…
					{:else}
						<CheckIcon size={15} />
						Save {completeRows.length} payment{completeRows.length === 1 ? '' : 's'}
					{/if}
				</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
