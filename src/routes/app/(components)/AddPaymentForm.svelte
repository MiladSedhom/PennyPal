<script lang="ts">
	import { enhance } from '$app/forms'
	import type { SubmitFunction } from '../$types'
	import { page } from '$app/stores'
	import Select from '$lib/components/Select.svelte'

	let selectedTags: string[]
	const options = $page.data.tags.map((o: string) => ({ label: o, value: o }))

	let dateInput: HTMLDataElement
	const submitter: SubmitFunction = () => {
		const dateValue = dateInput.value
		return async ({ update }) => {
			await update()
			// keeping the date, cuz the enchace action resest is
			dateInput.value = dateValue
			// when the form is reset it does not show on the select element so i have to do it myself, can also alterntivly keep its state
			selectedTags = []
		}
	}
</script>

<form action="?/addPayment" method="post" use:enhance={submitter}>
	<div class="field">
		<label for="amount">Amount</label>
		<input type="number" name="amount" id="amount" placeholder="amount" />
		{#if $page.form?.errors?.amount}
			<p class="error">{$page.form.errors.amount}</p>
		{/if}
	</div>

	<div class="field">
		<label for="">Tags</label>
		<Select name="tags" id="tags" bind:value={selectedTags} multiple {options} />
		{#if $page.form?.errors?.tags}
			<div class="error">{$page.form.errors.tags}</div>
		{/if}
	</div>

	<div class="field">
		<label for="date">Date</label>
		<input bind:this={dateInput} type="date" name="date" id="date" value={new Date().toISOString().substring(0, 10)} />
		{#if $page.form?.errors?.date}
			<div class="error">{$page.form.errors.date}</div>
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

<style>
	form {
		/* not using margin cuz it doesnt work with the transition */
		padding-bottom: var(--spacing-48);
	}

	.field {
		margin-bottom: var(--spacing-16);
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
</style>
