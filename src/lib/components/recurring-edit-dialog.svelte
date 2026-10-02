<script lang="ts">
	import ResponsiveDialog from '#lib/components/pp/responsive-dialog.svelte'
	import * as Select from '#lib/components/ui/select/index.js'
	import { Button } from '#lib/components/ui/button/index.js'
	import DatePicker from '#lib/components/ui/date-picker/date-picker.svelte'
	import TagMultiSelect from '#lib/components/pp/tag-multiselect.svelte'
	import { createRecurringPayment, updateRecurringPayment } from '#lib/remote/recurring.remote.js'
	import {
		MAX_INTERVAL_COUNT,
		intervalUnit,
		nextOccurrences,
		occurrence,
		type RecurringInterval,
		type Schedule
	} from '#lib/recurrence.js'
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

<ResponsiveDialog
	open={rule !== null}
	title={editing ? 'Edit recurring payment' : 'New recurring payment'}
	{onclose}
	class="max-w-[460px]"
>
	<form
		class="flex flex-col gap-4 px-4 pb-4 md:px-6 md:py-5"
		onsubmit={(e) => {
			e.preventDefault()
			save()
		}}
	>
		<div class="grid grid-cols-2 gap-3">
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
			<div class="flex flex-col gap-1.5">
				<span class="caption">Starts</span>
				<DatePicker
					bind:value={startDate}
					class="w-full rounded-[10px]! border-transparent bg-muted! px-3!"
					title={startDate.toString()}
				/>
			</div>
		</div>

		<div class="flex flex-col gap-1.5">
			<span class="caption">Repeats every</span>
			<div class="flex items-center gap-2">
				<input
					type="number"
					bind:value={intervalCount}
					min="1"
					max={MAX_INTERVAL_COUNT}
					step="1"
					class="w-20 rounded-[10px] border bg-muted px-3 py-2 text-right font-mono text-[13.5px] font-medium text-foreground {intervalCountInvalid
						? 'border-destructive'
						: 'border-transparent'}"
				/>
				<Select.Root type="single" bind:value={interval}>
					<Select.Trigger class="flex-1 rounded-[10px] border-transparent bg-muted text-[13.5px] font-medium">
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
			<span class="caption">Schedule</span>
			<div class="inline-flex gap-1 self-start rounded-[10px] bg-muted p-1">
				{#each [{ v: false, label: 'Fixed dates' }, { v: true, label: 'Rolls from each payment' }] as opt (opt.label)}
					<button
						type="button"
						onclick={() => (rolling = opt.v)}
						class="rounded-[7px] border-none px-3 py-1.5 text-[12.5px] font-semibold"
						class:bg-card={rolling === opt.v}
						class:text-foreground={rolling === opt.v}
						class:shadow-xs={rolling === opt.v}
						class:bg-transparent={rolling !== opt.v}
						class:text-faint={rolling !== opt.v}
					>
						{opt.label}
					</button>
				{/each}
			</div>
			<span class="text-[12px] text-faint">
				{rolling
					? 'Each cycle starts from when you actually pay — pay early or late and the schedule follows.'
					: 'Payments land on the same calendar dates regardless of when you pay.'}
			</span>
		</div>

		<div class="flex flex-col gap-1.5">
			<span class="caption">Ends <span class="normal-case text-faint">(optional)</span></span>
			<div class="flex items-center gap-2">
				<DatePicker
					bind:value={endDate}
					class="w-full rounded-[10px]! {endDateInvalid ? 'border-destructive' : 'border-transparent'} bg-muted! px-3!"
					title={endDate?.toString() ?? 'Never'}
				/>
				{#if endDate}
					<button
						type="button"
						onclick={() => (endDate = undefined)}
						class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-faint hover:bg-muted hover:text-foreground"
						aria-label="Clear end date"
					>
						<XIcon size={13} />
					</button>
				{/if}
			</div>
			{#if endDateInvalid}
				<span class="text-[12px] text-destructive">End date must be after the start date.</span>
			{/if}
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

		{#if preview.length > 0}
			<div class="rounded-[10px] bg-muted px-3 py-2.5 text-[12.5px] text-muted-foreground">
				Next: {preview.map((d) => previewFormatter.format(d)).join(' · ')}
				{#if backfillCount > 0}
					<span class="mt-1 block text-faint">
						Will create {backfillCount} back-dated payment{backfillCount === 1 ? '' : 's'} right away.
					</span>
				{/if}
			</div>
		{/if}

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
</ResponsiveDialog>
