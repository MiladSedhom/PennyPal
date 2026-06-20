<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog'
	import * as Select from '$lib/components/ui/select'
	import { Button } from '$lib/components/ui/button'
	import DatePicker from '$lib/components/ui/date-picker/date-picker.svelte'
	import TagMultiSelect from '$lib/components/pp/tag-multiselect.svelte'
	import Caption from '$lib/components/pp/caption.svelte'
	import { createRecurringPayment, updateRecurringPayment } from '$lib/remote/recurring.remote'
	import {
		MAX_INTERVAL_COUNT,
		intervalUnit,
		nextOccurrences,
		occurrence,
		type RecurringInterval,
		type Schedule
	} from '$lib/recurrence'
	import { CalendarDate, getLocalTimeZone, type DateValue } from '@internationalized/date'
	import XIcon from '@lucide/svelte/icons/x'
	import CheckIcon from '@lucide/svelte/icons/check'
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle'

	type Tag = { id: number; name: string; color: string; icon: string }
	type RuleRow = {
		id: number
		amount: number
		note: string | null
		interval: RecurringInterval
		intervalCount: number
		startDate: string | Date
		endDate: string | Date | null
		rolling: boolean
		tags: Tag[]
	}

	let {
		rule,
		tags,
		onclose,
		onsaved
	}: {
		/** A rule to edit, 'new' for create mode, or null when closed. */
		rule: RuleRow | 'new' | null
		tags: Tag[]
		onclose: () => void
		onsaved?: () => void
	} = $props()

	const editing = $derived(rule !== null && rule !== 'new' ? rule : null)

	function toCalendarDate(d: string | Date) {
		const date = new Date(d)
		return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
	}
	const today = () => toCalendarDate(new Date())

	// Writable deriveds: editable copies that reset whenever a different rule opens.
	let amount = $derived(editing?.amount ?? 0)
	let note = $derived(editing?.note ?? '')
	let selectedTags = $derived(editing?.tags.map((t) => t.id) ?? [])
	let interval = $derived<RecurringInterval>(editing?.interval ?? 'monthly')
	let intervalCount = $derived(editing?.intervalCount ?? 1)
	let startDate = $derived<DateValue>(editing ? toCalendarDate(editing.startDate) : today())
	let endDate = $derived<DateValue | undefined>(editing?.endDate ? toCalendarDate(editing.endDate) : undefined)
	let rolling = $derived(editing?.rolling ?? false)

	const schedule = $derived<Schedule>({
		interval,
		intervalCount: intervalCount || 1,
		startDate: startDate.toDate(getLocalTimeZone())
	})
	const endDateAsDate = $derived(endDate ? endDate.toDate(getLocalTimeZone()) : null)

	const intervalCountInvalid = $derived(
		!Number.isInteger(intervalCount) || intervalCount < 1 || intervalCount > MAX_INTERVAL_COUNT
	)
	const unitLabel = $derived(intervalUnit(interval, intervalCount || 1))
	const endDateInvalid = $derived(endDateAsDate !== null && endDateAsDate < schedule.startDate)
	const canSave = $derived(amount > 0 && !intervalCountInvalid && !endDateInvalid)

	const preview = $derived.by(() => {
		if (intervalCountInvalid) return []
		return nextOccurrences(schedule, new Date(), 3, endDateAsDate)
	})
	// How many payments a past start date will create immediately on save.
	// Rolling rules only ever create one outstanding payment, so we don't preview a backfill.
	const backfillCount = $derived.by(() => {
		if (intervalCountInvalid || editing || rolling) return 0
		const now = Date.now()
		let count = 0
		while (count < 100) {
			const date = occurrence(schedule, count)
			if (date.getTime() > now) break
			if (endDateAsDate && date.getTime() > endDateAsDate.getTime()) break
			count++
		}
		return count
	})

	const previewFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

	let saving = $state(false)

	async function save() {
		if (!rule || !canSave) return
		saving = true
		try {
			const payload = {
				amount,
				note,
				tags: selectedTags,
				interval,
				intervalCount,
				startDate: schedule.startDate,
				endDate: endDateAsDate,
				rolling
			}
			if (editing) await updateRecurringPayment({ id: editing.id, ...payload })
			else await createRecurringPayment(payload)
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
	<Dialog.Content class="max-w-[460px] gap-0 rounded-2xl border-none bg-card p-0 shadow-2xl" showCloseButton={false}>
		<div class="flex items-center justify-between border-b border-border-soft px-6 py-4">
			<Dialog.Title class="m-0 font-display text-[19px] font-bold tracking-[-0.025em]">
				{editing ? 'Edit recurring payment' : 'New recurring payment'}
			</Dialog.Title>
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
				<div class="flex flex-col gap-1.5">
					<Caption>Starts</Caption>
					<DatePicker
						bind:value={startDate}
						class="w-full rounded-[10px]! border-transparent bg-bg-warm! px-3!"
						title={startDate.toString()}
					/>
				</div>
			</div>

			<div class="flex flex-col gap-1.5">
				<Caption>Repeats every</Caption>
				<div class="flex items-center gap-2">
					<input
						type="number"
						bind:value={intervalCount}
						min="1"
						max={MAX_INTERVAL_COUNT}
						step="1"
						class="w-20 rounded-[10px] border bg-bg-warm px-3 py-2 text-right font-mono text-[13.5px] font-medium text-foreground {intervalCountInvalid
							? 'border-(--danger)'
							: 'border-transparent'}"
					/>
					<Select.Root type="single" bind:value={interval}>
						<Select.Trigger class="flex-1 rounded-[10px] border-transparent bg-bg-warm text-[13.5px] font-medium">
							{unitLabel}
						</Select.Trigger>
						<Select.Content class="rounded-xl border-none bg-card shadow-xl">
							<Select.Item value="daily" label="days" />
							<Select.Item value="weekly" label="weeks" />
							<Select.Item value="monthly" label="months" />
							<Select.Item value="yearly" label="years" />
						</Select.Content>
					</Select.Root>
				</div>
			</div>

			<div class="flex flex-col gap-1.5">
				<Caption>Schedule</Caption>
				<div class="inline-flex gap-1 self-start rounded-[10px] bg-bg-warm p-1">
					{#each [{ v: false, label: 'Fixed dates' }, { v: true, label: 'Rolls from each payment' }] as opt (opt.label)}
						<button
							type="button"
							onclick={() => (rolling = opt.v)}
							class="rounded-[7px] border-none px-3 py-1.5 text-[12.5px] font-semibold"
							class:bg-card={rolling === opt.v}
							class:text-foreground={rolling === opt.v}
							class:shadow-xs={rolling === opt.v}
							class:bg-transparent={rolling !== opt.v}
							class:text-text-mute={rolling !== opt.v}
						>
							{opt.label}
						</button>
					{/each}
				</div>
				<span class="text-[12px] text-text-mute">
					{rolling
						? 'Each cycle starts from when you actually pay — pay early or late and the schedule follows.'
						: 'Payments land on the same calendar dates regardless of when you pay.'}
				</span>
			</div>

			<div class="flex flex-col gap-1.5">
				<Caption>Ends <span class="normal-case text-text-mute">(optional)</span></Caption>
				<div class="flex items-center gap-2">
					<DatePicker
						bind:value={endDate}
						class="w-full rounded-[10px]! {endDateInvalid
							? 'border-(--danger)'
							: 'border-transparent'} bg-bg-warm! px-3!"
						title={endDate?.toString() ?? 'Never'}
					/>
					{#if endDate}
						<button
							type="button"
							onclick={() => (endDate = undefined)}
							class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-text-mute hover:bg-bg-warm hover:text-foreground"
							aria-label="Clear end date"
						>
							<XIcon size={13} />
						</button>
					{/if}
				</div>
				{#if endDateInvalid}
					<span class="text-[12px] text-(--danger)">End date must be after the start date.</span>
				{/if}
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

			{#if preview.length > 0}
				<div class="rounded-[10px] bg-bg-warm px-3 py-2.5 text-[12.5px] text-text-dim">
					Next: {preview.map((d) => previewFormatter.format(d)).join(' · ')}
					{#if backfillCount > 0}
						<span class="mt-1 block text-text-mute">
							Will create {backfillCount} back-dated payment{backfillCount === 1 ? '' : 's'} right away.
						</span>
					{/if}
				</div>
			{/if}

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
					disabled={saving || !canSave}
				>
					{#if saving}
						<LoaderCircleIcon size={15} class="animate-spin" />
					{:else}
						<CheckIcon size={15} />
					{/if}
					{editing ? 'Save changes' : 'Create rule'}
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
