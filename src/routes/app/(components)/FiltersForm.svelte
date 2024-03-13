<script lang="ts">
	import Select from '$lib/components/Select.svelte'
	import { queryParameters, ssp } from 'sveltekit-search-params'
	import { page } from '$app/stores'
	import { getLastWeeksDate } from '$lib/utils'

	const filters = queryParameters({
		startDate: ssp.string(),
		endDate: ssp.string(),
		sortBy: ssp.string(),
		sortType: ssp.string()
	})

	let selectedOptions: string[] = $filters.tags ? $filters?.tags?.split(',') : []

	const options = $page.data.tags?.map((t: string) => ({ label: t, value: t })) || []
</script>

<form action="filter">
	<div class="field">
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

	<div class="field">
		<span class="oneline">
			<label for="start-date">Start Date</label>
			<input
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
	</div>

	<div class="field">
		<span class="oneline">
			<label for="end-date">End Date</label>
			<input
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
	</div>
	<div class="field">
		<span class="sort">
			<label for="sort-by">Sort By</label>
			<Select
				bind:value={$filters.sortBy}
				options={[
					{ label: 'date', value: 'date' },
					{ label: 'amount', value: 'amount' }
				]}
				--width="calc(100% / 1.68 - 1rem - 34px)"
			/>

			<button
				class="toggle-sort-type"
				type="button"
				on:click={() => {
					if (!$filters.sortType) {
						$filters.sortType = 'asc'
						return
					}
					if ($filters.sortType === 'asc') $filters.sortType = 'desc'
					else if ($filters.sortType === 'desc') $filters.sortType = 'asc'
				}}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"
					><g fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
						><path d="M10.293 7.707a1 1 0 0 1 0-1.414l3-3a1 1 0 1 1 1.414 1.414l-3 3a1 1 0 0 1-1.414 0Z" /><path
							d="M17.707 7.707a1 1 0 0 1-1.414 0l-3-3a1 1 0 0 1 1.414-1.414l3 3a1 1 0 0 1 0 1.414Z"
						/><path
							d="M14 5a1 1 0 0 1 1 1v8a1 1 0 1 1-2 0V6a1 1 0 0 1 1-1Zm-4.293 7.293a1 1 0 0 1 0 1.414l-3 3a1 1 0 0 1-1.414-1.414l3-3a1 1 0 0 1 1.414 0Z"
						/><path d="M2.293 12.293a1 1 0 0 1 1.414 0l3 3a1 1 0 1 1-1.414 1.414l-3-3a1 1 0 0 1 0-1.414Z" /><path
							d="M6 15a1 1 0 0 1-1-1V6a1 1 0 1 1 2 0v8a1 1 0 0 1-1 1Z"
						/></g
					></svg
				>
			</button>
		</span>
	</div>
</form>

<style>
	form {
		/* not using margin cuz it doesnt work with the transition */
		padding-bottom: var(--spacing-48);
	}

	.field {
		margin-bottom: var(--spacing-16);
	}

	.oneline {
		display: flex;
		align-items: center;
		justify-content: space-between;

		& input {
			width: calc(100% / 1.618);
		}
	}

	.sort {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;

		& label {
			flex-grow: 1;
		}

		& .toggle-sort-type {
			background-color: var(--color-fields);
			color: var(--color-text-alt);
			min-width: 40px;
			width: 40px;
			height: 40px;
			display: grid;
			place-items: center;
		}

		& svg {
			margin: 0;
		}
	}
</style>
