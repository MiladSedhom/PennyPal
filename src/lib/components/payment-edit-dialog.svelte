<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog'
	import { Button } from '$lib/components/ui/button'
	import DatePicker from '$lib/components/ui/date-picker/date-picker.svelte'
	import TagMultiSelect from '$lib/components/pp/tag-multiselect.svelte'
	import Caption from '$lib/components/pp/caption.svelte'
	import { updatePayment } from '$lib/remote/payments.remote'
	import { CalendarDate, getLocalTimeZone } from '@internationalized/date'
	import XIcon from '@lucide/svelte/icons/x'
	import CheckIcon from '@lucide/svelte/icons/check'
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle'

	type Tag = { id: number; name: string; color: string; icon: string }
	type PaymentRow = {
		id: number
		amount: number
		note: string | null
		createdAt: string | Date
		tags: Tag[]
	}

	let {
		payment,
		tags,
		onclose,
		onsaved
	}: {
		payment: PaymentRow | null
		tags: Tag[]
		onclose: () => void
		onsaved?: () => void
	} = $props()

	// Writable deriveds: editable copies that reset whenever a different payment opens.
	let amount = $derived(payment?.amount ?? 0)
	let note = $derived(payment?.note ?? '')
	let selectedTags = $derived(payment?.tags.map((t) => t.id) ?? [])
	let date = $derived.by(() => {
		const d = payment ? new Date(payment.createdAt) : new Date()
		return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate())
	})

	let saving = $state(false)

	async function save() {
		if (!payment || !(amount > 0)) return
		saving = true
		try {
			// Keep the original time of day so intra-day ordering survives edits that don't touch the date.
			const orig = new Date(payment.createdAt)
			const next = date.toDate(getLocalTimeZone())
			next.setHours(orig.getHours(), orig.getMinutes(), orig.getSeconds(), orig.getMilliseconds())
			await updatePayment({ id: payment.id, amount, note, tags: selectedTags, date: next })
			onsaved?.()
			onclose()
		} finally {
			saving = false
		}
	}
</script>

<Dialog.Root
	open={payment !== null}
	onOpenChange={(isOpen) => {
		if (!isOpen) onclose()
	}}
>
	<Dialog.Content class="max-w-[440px] gap-0 rounded-2xl border-none bg-card p-0 shadow-2xl" showCloseButton={false}>
		<div class="flex items-center justify-between border-b border-border-soft px-6 py-4">
			<Dialog.Title class="m-0 font-display text-[19px] font-bold tracking-[-0.025em]">Edit payment</Dialog.Title>
			<button
				type="button"
				onclick={onclose}
				class="flex h-8 w-8 items-center justify-center rounded-full border-none bg-bg-warm p-0 text-text-dim hover:bg-mint"
				aria-label="Close"
			>
				<XIcon size={16} />
			</button>
		</div>

		<form
			class="flex flex-col gap-4 px-6 py-5"
			onsubmit={(e) => {
				e.preventDefault()
				save()
			}}
		>
			<div class="grid grid-cols-2 gap-3">
				<div class="flex flex-col gap-1.5">
					<Caption>Date</Caption>
					<DatePicker
						bind:value={date}
						class="w-full rounded-[10px]! border-transparent bg-bg-warm! px-3!"
						title={date.toString()}
					/>
				</div>
				<div class="flex flex-col gap-1.5">
					<Caption>Amount</Caption>
					<input
						type="number"
						bind:value={amount}
						placeholder="0"
						step="1"
						min="0"
						class="w-full rounded-[10px] border border-transparent bg-bg-warm px-3 py-2 text-right font-mono text-[13.5px] font-medium text-foreground"
					/>
				</div>
			</div>

			<div class="flex flex-col gap-1.5">
				<Caption>Tags</Caption>
				<div class="rounded-[10px] bg-bg-warm">
					<TagMultiSelect {tags} bind:selected={selectedTags} />
				</div>
			</div>

			<div class="flex flex-col gap-1.5">
				<Caption>Note</Caption>
				<input
					bind:value={note}
					placeholder="—"
					class="w-full rounded-[10px] border border-transparent bg-bg-warm px-3 py-2 text-[13.5px] text-foreground"
				/>
			</div>

			<div class="mt-1 flex justify-end gap-2">
				<button
					type="button"
					onclick={onclose}
					class="border-none bg-transparent px-3 py-2 text-[13.5px] font-semibold text-text-dim hover:text-foreground"
				>
					Cancel
				</button>
				<Button
					type="submit"
					class="h-[36px] gap-2 rounded-full bg-mint px-[18px] text-[13.5px] font-semibold text-foreground hover:bg-mint-deep"
					disabled={saving || !(amount > 0)}
				>
					{#if saving}
						<LoaderCircleIcon size={15} class="animate-spin" />
					{:else}
						<CheckIcon size={15} />
					{/if}
					Save changes
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
