<script lang="ts">
	import ResponsiveDialog from '$lib/components/pp/responsive-dialog.svelte'
	import { Button } from '$lib/components/ui/button'
	import DatePicker from '$lib/components/ui/date-picker/date-picker.svelte'
	import { renewRecurringPayment } from '$lib/remote/recurring.remote'
	import { formatMoney } from '$lib/utils'
	import { CalendarDate, getLocalTimeZone, type DateValue } from '@internationalized/date'
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

<ResponsiveDialog open={rule !== null} title="Log payment" {onclose} class="max-w-[400px]">
	<form
		class="flex flex-col gap-4 px-4 pb-4 md:px-6 md:py-5"
		onsubmit={(e) => {
			e.preventDefault()
			save()
		}}
	>
		<div class="flex items-baseline justify-between">
			<span class="caption">Amount</span>
			<span class="font-display text-[22px] font-bold tracking-[-0.02em] tabular-nums">
				{formatMoney(rule?.amount ?? 0)}
			</span>
		</div>

		<div class="flex flex-col gap-1.5">
			<span class="caption">Paid on</span>
			<DatePicker
				bind:value={date}
				class="w-full rounded-[10px]! border-transparent bg-muted! px-3!"
				title={date.toString()}
			/>
			<span class="text-[12px] text-faint">The next cycle will start one interval after this date.</span>
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
</ResponsiveDialog>
