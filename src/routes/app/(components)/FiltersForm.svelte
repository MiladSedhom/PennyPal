<script lang="ts">
	import Select from '$lib/components/Select.svelte'
	import { queryParameters, ssp } from 'sveltekit-search-params'
	import { page } from '$app/stores'
	import { getLastWeeksDate } from '$lib/utils'
	import { CalendarDate } from '@internationalized/date'
	import DatePicker from './DatePicker.svelte'

	const filters = queryParameters({
		startDate: ssp.string(),
		endDate: ssp.string(),
		sortBy: ssp.string(),
		sortType: ssp.string()
	})

	const initialStartDate = $filters.startDate ? new Date($filters.startDate) : getLastWeeksDate()
	const initialEndDate = $filters.endDate ? new Date($filters.endDate) : new Date()

	let startDateValue = new CalendarDate(
		initialStartDate.getFullYear(),
		initialStartDate.getMonth() + 1,
		initialStartDate.getDate()
	)
	let endDateValue = new CalendarDate(
		initialEndDate.getFullYear(),
		initialEndDate.getMonth() + 1,
		initialEndDate.getDate()
	)

	$: $filters.startDate = startDateValue.toString()
	$: $filters.endDate = endDateValue.toString()

	let selectedOptions: string[] = $filters.tags ? $filters.tags.split(',') : []

	const options = $page.data.tags?.map((t: string) => ({ label: t, value: t })) || []
</script>

<form action="filter">
	<div class="m-b-4">
		<label class="text-3 text-text-90 m-b-1.5 block select-none" for="tags">Tags</label>
		<Select
			multiple
			bind:value={selectedOptions}
			{options}
			onSelect={() => {
				$filters.tags = selectedOptions.toString()
			}}
		/>
	</div>

	<div class="m-b-4">
		<DatePicker label="Starting from" bind:value={startDateValue} />
	</div>
	<div class="m-b-4">
		<DatePicker label="Until" bind:value={endDateValue} />
	</div>

	<label class="text-3 text-text-90 m-b-1.5 block select-none" for="sort-by">Sort By</label>
	<span class="m-b-4 flex items-center justify-between gap-4">
		<div class="grow">
			<Select
				bind:value={$filters.sortBy}
				options={[
					{ label: 'Date', value: 'date' },
					{ label: 'Amount', value: 'amount' }
				]}
			/>
		</div>

		<button
			class="bg-fields hover:bg-muted active:bg-primary transition-duration-200 hover:scale-103 active:scale-97 rounded-1 h-12 w-12 transition-transform"
			type="button"
			title="Sort type"
			on:click={() => {
				if (!$filters.sortType) {
					$filters.sortType = 'asc'
					return
				}
				if ($filters.sortType === 'asc') $filters.sortType = 'desc'
				else if ($filters.sortType === 'desc') $filters.sortType = 'asc'
			}}
		>
			<div class="i-tabler-arrows-sort text-5 text-text"></div>
		</button>
	</span>
</form>
