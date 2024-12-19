<script lang="ts">
	import Select from '$lib/components/Select.svelte'
	import { queryParameters, ssp } from 'sveltekit-search-params'
	import { page } from '$app/stores'
	import { getFirstDayOfTheYear, getLastWeeksDate } from '$lib/utils'
	import { CalendarDate } from '@internationalized/date'
	import DatePicker from './DatePicker.svelte'
	import { persisted } from '$lib/stores/persist'

	const persistedFilters = persisted('filters', {} as Filters)

	const filters = queryParameters({
		startDate: ssp.string($persistedFilters?.startDate),
		endDate: ssp.string($persistedFilters?.endDate),
		sortBy: ssp.string($persistedFilters?.sortBy),
		sortType: ssp.string($persistedFilters?.sortType)
	})

	filters.subscribe((v) => ($persistedFilters = v as Filters))

	const initialStartDate = $filters.startDate ? new Date($filters.startDate) : getFirstDayOfTheYear()
	const initialEndDate = $filters.endDate ? new Date($filters.endDate) : new Date()

	let startDateValue = $state(new CalendarDate(
		initialStartDate.getFullYear(),
		initialStartDate.getMonth() + 1,
		initialStartDate.getDate()
	))
	let endDateValue = $state(new CalendarDate(
		initialEndDate.getFullYear(),
		initialEndDate.getMonth() + 1,
		initialEndDate.getDate()
	))

	let $filters.startDate = $derived(startDateValue.toString())
	let $filters.endDate = $derived(endDateValue.toString())

	const options = $page.data.tags?.map((t: string) => ({ label: t, value: t })) || []
	let selectedOptions: string[] = $state($filters.tags ? $filters.tags.split(',') : [])

	interface Filters {
		startDate: string
		endDate: string
		sortBy: 'amount' | 'date'
		sortType: 'asc' | 'desc'
	}
</script>

<form action="filter">
	<div class="m-b-4">
		<label class="text-3 text-text/90 m-b-1.5 block select-none" for="tags">Tags</label>
		<Select
			multiple
			bind:value={selectedOptions}
			{options}
			placeholder="Pick tags to view..."
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

	<div class="transition-all {$page.route.id !== '/app' && 'pointer-events-none opacity-50 '}">
		<h3 class="text-14px fw-500 m-t-8 m-b-2">
			Sorting Options <span class="i-tabler-sort-descending text-5 float-right"></span>
		</h3>

		<label class="text-3 text-text/90 m-b-1.5 block select-none" for="sort-by">Sort By</label>
		<span class="m-b-4 flex items-center justify-between gap-4">
			<div class="w-[calc(100%-1rem-48px)] grow">
				<Select
					bind:value={$filters.sortBy}
					options={[
						{ label: 'Date', value: 'date' },
						{ label: 'Amount', value: 'amount' }
					]}
				/>
			</div>

			<button
				class="bg-fields hover:bg-muted active:bg-primary transition-duration-200 hover:scale-103 active:scale-97 rounded-1 h-12 w-12 shrink-0 transition-all"
				type="button"
				title="Sort type"
				onclick={() => {
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
	</div>
</form>
