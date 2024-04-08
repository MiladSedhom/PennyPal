<script lang="ts">
	import { applyAction, enhance } from '$app/forms'
	import type { SubmitFunction } from '../$types'
	import { page } from '$app/stores'
	import Select from '$lib/components/Select.svelte'

	export let onSubmit: Function | null = null

	let selectedTags: string[]
	let loading: boolean = false
	const options = $page.data.tags.map((o: string) => ({ label: o, value: o }))

	const submitter: SubmitFunction = () => {
		loading = true
		return async ({ update, result }) => {
			applyAction(result)
			loading = false
			if (result.type === 'success') {
				onSubmit?.()
			}
			await update({ reset: false })
		}
	}
</script>

<form action={`/app/?/addPayment`} method="post" use:enhance={submitter}>
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
			<div class="error">{$page.form.errors.tags[0]}</div>
		{/if}
	</div>

	<div class="field">
		<label for="date">Date</label>
		<input type="date" name="date" id="date" value={new Date().toISOString().substring(0, 10)} />
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

	<button type="submit" class:loading disabled={loading}>
		{#if !loading}
			Add Payment
		{:else}
			Loading
		{/if}
	</button>
</form>

<style>
	form {
		/* not using margin cuz it doesnt work with the transition */
		padding: var(--spacing-48);
		border: 2px solid var(--color-primary);
	}

	.field {
		margin-bottom: var(--spacing-16);
	}

	button {
		height: 2rem;
		padding: 0 1rem;
		min-width: 16ch;
		background-color: var(--color-primary);
		color: var(--color-text-on-primary);
		font-size: var(--fs-base);
		font-weight: normal;
		float: right;
	}

	.loading {
		filter: saturate(0.3);
	}

	.error {
		margin-top: 4px;
	}
</style>
