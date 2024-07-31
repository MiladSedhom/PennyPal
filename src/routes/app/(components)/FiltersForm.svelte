<script lang="ts">
	import Select from '$lib/components/Select.svelte'
	import { queryParameters, ssp } from 'sveltekit-search-params'
	import { page } from '$app/stores'
	import { getLastWeeksDate } from '$lib/utils'

	let dateRange: any
	let form: HTMLElement

	const filters = queryParameters({
		startDate: ssp.string(),
		endDate: ssp.string(),
		sortBy: ssp.string(),
		sortType: ssp.string()
	})

	let selectedOptions: string[] = $filters.tags ? $filters?.tags?.split(',') : []

	const options = $page.data.tags?.map((t: string) => ({ label: t, value: t })) || []
</script>

<form action="filter" bind:this={form}>
	<div class="m-b-4">
		<label for="tags">Tags</label>
		<Select
			multiple
			bind:value={selectedOptions}
			{options}
			onSelect={() => {
				$filters.tags = selectedOptions.toString()
			}}
		/>
	</div>

	<span class="m-b-4 flex items-center justify-between">
		<label for="start-date">Start Date</label>
		<input
			class="w-[calc(100%/1.618)]"
			type="date"
			name="start-date"
			id="start-date"
			value={getLastWeeksDate().toISOString().substring(0, 10)}
			on:input={(e) => {
				// @ts-ignore
				$filters.startDate = e.target.value
			}}
		/>
	</span>

	<span class="m-b-4 flex items-center justify-between">
		<label for="end-date">End Date</label>
		<input
			class="w-[calc(100%/1.618)]"
			type="date"
			name="end-date"
			id="end-date"
			value={new Date().toISOString().substring(0, 10)}
			on:input={(e) => {
				// @ts-ignore
				$filters.endDate = e.target.value
			}}
		/>
	</span>
	<span class="m-b-4 flex items-center justify-center gap-4">
		<label class="grow" for="sort-by">Sort By</label>
		<Select
			bind:value={$filters.sortBy}
			options={[
				{ label: 'date', value: 'date' },
				{ label: 'amount', value: 'amount' }
			]}
			--width="calc(100% / 1.68 - 1rem - 34px)"
		/>

		<button
			class="bg-fields h-10 w-10"
			type="button"
			title="Sort Type"
			on:click={() => {
				if (!$filters.sortType) {
					$filters.sortType = 'asc'
					return
				}
				if ($filters.sortType === 'asc') $filters.sortType = 'desc'
				else if ($filters.sortType === 'desc') $filters.sortType = 'asc'
			}}
		>
			<div class="i-tabler-arrows-double-sw-ne text-5 text-text"></div>
		</button>
	</span>
</form>
