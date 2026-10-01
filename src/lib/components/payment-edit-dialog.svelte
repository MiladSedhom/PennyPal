<script lang="ts">
	import ResponsiveDialog from '$lib/components/pp/responsive-dialog.svelte'
	import { Button } from '$lib/components/ui/button'
	import DatePicker from '$lib/components/ui/date-picker/date-picker.svelte'
	import TagMultiSelect from '$lib/components/pp/tag-multiselect.svelte'
	import { updatePayment } from '$lib/remote/payments.remote'
	import { CalendarDate, getLocalTimeZone } from '@internationalized/date'
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

<ResponsiveDialog open={payment !== null} title="Edit payment" {onclose} class="max-w-[440px]">
	<form
		class="flex flex-col gap-4 px-4 pb-4 md:px-6 md:py-5"
		onsubmit={(e) => {
			e.preventDefault()
			save()
		}}
	>
		<div class="grid grid-cols-2 gap-3">
			<div class="flex flex-col gap-1.5">
				<span class="caption">Date</span>
				<DatePicker
					bind:value={date}
					class="w-full rounded-[10px]! border-transparent bg-muted! px-3!"
					title={date.toString()}
				/>
			</div>
			<div class="flex flex-col gap-1.5">
				<span class="caption">Amount</span>
				<input
					type="number"
					bind:value={amount}
					placeholder="0"
					step="1"
					min="0"
					class="w-full rounded-[10px] border border-transparent bg-muted px-3 py-2 text-right font-mono text-[13.5px] font-medium text-foreground"
				/>
			</div>
		</div>

		<div class="flex flex-col gap-1.5">
			<span class="caption">Tags</span>
			<div class="rounded-[10px] bg-muted">
				<TagMultiSelect {tags} bind:selected={selectedTags} />
			</div>
		</div>

		<div class="flex flex-col gap-1.5">
			<span class="caption">Note</span>
			<input
				bind:value={note}
				placeholder="—"
				class="w-full rounded-[10px] border border-transparent bg-muted px-3 py-2 text-[13.5px] text-foreground"
			/>
		</div>

		<div class="mt-1 flex gap-2 md:justify-end">
			<button
				type="button"
				onclick={onclose}
				class="flex-1 border-none bg-transparent px-3 py-2 text-[13.5px] font-semibold text-muted-foreground hover:text-foreground md:flex-none"
			>
				Cancel
			</button>
			<Button
				type="submit"
				class="h-[36px] flex-1 gap-2 rounded-full bg-muted px-[18px] text-[13.5px] font-semibold text-foreground hover:bg-foreground/10 md:flex-none"
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
</ResponsiveDialog>
