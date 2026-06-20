<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog'
	import { Button } from '$lib/components/ui/button'
	import DatePicker from '$lib/components/ui/date-picker/date-picker.svelte'
	import Caption from '$lib/components/pp/caption.svelte'
	import { renewRecurringPayment } from '$lib/remote/recurring.remote'
	import { formatMoney } from '$lib/utils'
	import { CalendarDate, getLocalTimeZone, type DateValue } from '@internationalized/date'
	import XIcon from '@lucide/svelte/icons/x'
	import CheckIcon from '@lucide/svelte/icons/check'
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle'

	type Rule = { id: number; amount: number; note: string | null }

	let {
		rule,
		onclose,
		onsaved
	}: {
		/** The rolling rule being paid, or null when closed. */
		rule: Rule | null
		onclose: () => void
		onsaved?: () => void
	} = $props()

	const today = () => {
		const d = new Date()
		return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate())
	}

	// Resets to today whenever a different rule opens.
	let date = $derived<DateValue>(rule ? today() : today())
	let saving = $state(false)

	async function save() {
		if (!rule) return
		saving = true
		try {
			await renewRecurringPayment({ id: rule.id, date: date.toDate(getLocalTimeZone()) })
			onsaved?.()
			onclose()
		} finally {
			saving = false
		}
	}
</script>

<Dialog.Root
	open={rule !== null}
	onOpenChange={(isOpen) => {
		if (!isOpen) onclose()
	}}
>
	<Dialog.Content class="max-w-[400px] gap-0 rounded-2xl border-none bg-card p-0 shadow-2xl" showCloseButton={false}>
		<div class="flex items-center justify-between border-b border-border-soft px-6 py-4">
			<Dialog.Title class="m-0 font-display text-[18px] font-bold tracking-[-0.025em]">Log payment</Dialog.Title>
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
			<div class="flex items-baseline justify-between">
				<Caption>Amount</Caption>
				<span class="font-display text-[22px] font-bold tracking-[-0.02em] tabular-nums">
					{formatMoney(rule?.amount ?? 0)}
				</span>
			</div>

			<div class="flex flex-col gap-1.5">
				<Caption>Paid on</Caption>
				<DatePicker
					bind:value={date}
					class="w-full rounded-[10px]! border-transparent bg-bg-warm! px-3!"
					title={date.toString()}
				/>
				<span class="text-[12px] text-text-mute">The next cycle will start one interval after this date.</span>
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
					disabled={saving}
				>
					{#if saving}
						<LoaderCircleIcon size={15} class="animate-spin" />
					{:else}
						<CheckIcon size={15} />
					{/if}
					Log payment
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
