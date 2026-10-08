<script lang="ts" module>
	import { DateFormatter, type DateValue } from '@internationalized/date'
	import type { DateRange } from 'bits-ui'

	const formatter = new DateFormatter('en-US', { month: 'short', day: 'numeric' })
	const formatDay = (date: DateValue) => formatter.format(date.toDate('UTC'))

	export function dateRangeLabel({ start, end }: DateRange): string {
		if (start && end) return `${formatDay(start)} – ${formatDay(end)}`
		if (start) return `From ${formatDay(start)}`
		return 'Date range'
	}
</script>

<script lang="ts">
	import { onDestroy } from 'svelte'
	import { endOfMonth, endOfYear, getLocalTimeZone, startOfMonth, startOfYear, today } from '@internationalized/date'
	import { RangeCalendar } from '#lib/components/ui/range-calendar/index.js'
	import * as ToggleGroup from '#lib/components/ui/toggle-group/index.js'
	import type { PaymentFilters } from '../filters.svelte'

	let {
		filters,
		months = 1,
		calendarClass
	}: { filters: PaymentFilters; months?: number; calendarClass?: string } = $props()

	// Holds a half-picked range until it's complete or the picker closes, so picking doesn't refetch on every click.
	let draft = $derived(filters.dateRange)

	const now = today(getLocalTimeZone())
	const lastMonth = now.subtract({ months: 1 })
	const presets = [
		{ label: 'This month', start: startOfMonth(now), end: endOfMonth(now) },
		{ label: 'Last month', start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) },
		{ label: 'Last 3 months', start: startOfMonth(now.subtract({ months: 2 })), end: endOfMonth(now) },
		{ label: 'Last 6 months', start: startOfMonth(now.subtract({ months: 5 })), end: endOfMonth(now) },
		{ label: 'This year', start: startOfYear(now), end: endOfYear(now) }
	]
	const activePreset = $derived(
		presets.find((p) => draft.start?.compare(p.start) === 0 && draft.end?.compare(p.end) === 0)?.label ?? ''
	)

	function pick(range: DateRange) {
		draft = range
		if (range.start && range.end) filters.dateRange = range
	}

	function pickPreset(label: string) {
		const preset = presets.find((p) => p.label === label)
		if (preset) pick({ start: preset.start, end: preset.end })
	}

	onDestroy(() => {
		if (draft.start && !draft.end) filters.dateRange = { start: draft.start, end: undefined }
	})
</script>

<RangeCalendar bind:value={() => draft, pick} numberOfMonths={months} class={calendarClass} />

<ToggleGroup.Root
	type="single"
	aria-label="Date presets"
	class="mt-2 px-1 pb-1"
	bind:value={() => activePreset, pickPreset}
>
	{#each presets as preset (preset.label)}
		<ToggleGroup.Item value={preset.label}>{preset.label}</ToggleGroup.Item>
	{/each}
</ToggleGroup.Root>
