<script lang="ts">
	import { Accordion, AccordionItem } from '$lib/components/Accordion'
	import { page } from '$app/stores'
	import { queryParameters, ssp } from 'sveltekit-search-params'
	import Select from '$lib/components/Select.svelte'

	const filters = queryParameters({
		startDate: ssp.string(getLastWeeksDate().toISOString().substring(0, 10)),
		endDate: ssp.string(new Date().toISOString().substring(0, 10)),
		sortBy: ssp.string('date'),
		sortType: ssp.string('desc')
	})

	let selectedOptions: string[] = $filters.tags ? $filters?.tags?.split(',') : []

	function getLastWeeksDate() {
		const now = new Date()
		return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
	}
</script>

<aside>
	<span class="logo"><span class="primary">Penny</span>Pal</span>
	<div class="forms-container">
		<Accordion colapse>
			<AccordionItem open>
				<h3 slot="header">Choose Your Filters</h3>

				<form slot="content" action="filter">
					<div class="field">
						<label for="tags">Tags</label>
						<Select
							multiple
							bind:selectedValues={selectedOptions}
							options={$page.data.tags.map((t) => ({ label: t, value: t }))}
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
								value={$filters.startDate}
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
								value={$filters.endDate}
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
							<select
								name="sort-by"
								id="sort-by"
								value={$filters.sortBy}
								on:change={(e) => {
									// @ts-ignore
									$filters.sortBy = e.target.value
								}}
							>
								<option value="amount">amount</option>
								<option value="date">date</option>
							</select>

							<button
								class="toggle-sort-type"
								type="button"
								on:click={() => {
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
										/><path
											d="M2.293 12.293a1 1 0 0 1 1.414 0l3 3a1 1 0 1 1-1.414 1.414l-3-3a1 1 0 0 1 0-1.414Z"
										/><path d="M6 15a1 1 0 0 1-1-1V6a1 1 0 1 1 2 0v8a1 1 0 0 1-1 1Z" /></g
									></svg
								>
							</button>
						</span>
					</div>
				</form>
			</AccordionItem>

			<AccordionItem>
				<h3 slot="header">Add A New Payment</h3>
				<form slot="content" action="?/addPayment" method="post">
					<div class="field">
						<label for="amount">Amount</label>
						<input type="number" name="amount" id="amount" placeholder="amount" />
						{#if $page.form?.errors?.amount}
							<p class="error">{$page.form.errors.amount}</p>
						{/if}
					</div>

					<div class="field">
						<label for="">Tags</label>
						<select name="tags" id="tags" multiple>
							<option value="food">food</option>
							<option value="drink">drink</option>
							<option value="fun">fun</option>
							<option value="fuck">fuck</option>
						</select>
						{#if $page.form?.error?.tags}
							<div class="error">{$page.form.error.tags}</div>
						{/if}
					</div>

					<div class="field">
						<label for="date">Date</label>
						<input type="date" name="date" id="date" value={new Date().toISOString().substring(0, 10)} />
						{#if $page.form?.error?.date}
							<div class="error">{$page.form.error.date}</div>
						{/if}
					</div>

					<div class="field">
						<label for="note">Note</label>
						<textarea name="note" id="note" />
						{#if $page.form?.errors?.note}
							<p class="error">{$page.form.errors.note}</p>
						{/if}
					</div>

					<button type="submit">Add Payment</button>
				</form>
			</AccordionItem>
		</Accordion>
	</div>
</aside>

<style>
	aside {
		display: flex;
		flex-direction: column;
		width: 20rem;
		min-width: 20rem;
		height: 100vh;
		flex-grow: 1;
		padding: calc(var(--spacing-32) - var(--scrollbar-width));
		scrollbar-gutter: stable both-edges;
		background-color: var(--color-dark);
		color: var(--color-text-alt);
		color-scheme: dark;
		overflow: auto;
		/* scrollbar-gutter: stable both-edges; */
		position: relative;
	}

	.logo {
		display: inline-block;
		font-size: 1.5rem;
		font-family: var(--serif);
		font-weight: bold;
		margin-bottom: var(--spacing-32);

		& .primary {
			color: var(--color-primary);
		}
	}

	h3 {
		font-size: var(--fs-base);
		font-weight: 400;
	}

	form {
		/* not using margin cuz it doesnt work with the transition */
		padding-bottom: var(--spacing-48);
	}

	:global(.select) {
		width: 100% !important;
		padding: 0 var(--spacing-16) !important;
		font-size: var(--fs-base) !important;
		background-color: var(--color-fields) !important;
		color: var(--color-text-alt) !important;
		border-radius: 2px !important;

		&:focus {
			outline: 1px solid color-mix(in srgb, var(--color-fields) 80%, var(--color-text-alt)) !important;
		}

		&::placeholder {
			color: var(--color-grey-70) !important;
		}
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

	button {
		height: 2rem;
		padding: 0 1rem;
		background-color: var(--color-primary);
		color: var(--color-text);
		font-size: var(--fs-base);
		font-weight: normal;
		float: right;
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
			width: 40px;
			height: 40px;
		}
	}

	.toggle-sort-type {
		display: grid;
		place-content: center;
	}
</style>
