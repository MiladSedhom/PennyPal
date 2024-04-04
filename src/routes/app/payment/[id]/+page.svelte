<script lang="ts">
	import { page } from '$app/stores'
	import Select from '$lib/components/Select.svelte'
	import type { SubmitFunction } from '@sveltejs/kit'
	import PaymentCard from '../../(components)/PaymentCard.svelte'
	import { enhance } from '$app/forms'

	export let data

	let payment = data.payments?.filter((p: any) => p.id === Number($page.params.id))[0]
	$: payment = data.payments?.filter((p: any) => p.id === Number($page.params.id))[0]

	let selectedTags = payment?.tags || []

	console.log($page?.data?.tags)
	let options = $page?.data?.tags.map((t: string) => ({ value: t, label: t }))

	const submitter: SubmitFunction = async () => {
		return async ({ update }) => {
			await update({ reset: false })
		}
	}
</script>

<div class="wrapper">
	{#if payment}
		<PaymentCard {payment} showButtons={false} />

		<form action="?/updatePayment" method="post" use:enhance={submitter}>
			<input type="hidden" name="id" id="id" value={payment.id} />
			<div class="field">
				<label for="amount">Amount</label>
				<input value={payment.amount} type="number" name="amount" id="amount" placeholder="amount" />
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
				<input type="date" name="date" id="date" value={payment.createdAt.toISOString().substring(0, 10)} />
				{#if $page.form?.errors?.date}
					<div class="error">{$page.form.errors.date}</div>
				{/if}
			</div>

			<div class="field">
				<label for="note">Note</label>
				<textarea value={payment.note ? payment.note : ''} name="note" id="note" />
				{#if $page.form?.errors?.note}
					<p class="error">{$page.form.errors.note}</p>
				{/if}
			</div>

			<button type="submit">Update Payment</button>
		</form>
	{/if}
</div>

<style>
	.wrapper {
		height: 100%;
		padding: 2rem 3rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	form {
		/* not using margin cuz it doesnt work with the transition */
		padding-bottom: var(--spacing-48);
		background-color: var(--color-dark);
		width: clamp(320px, 90%, 909px);
		padding: 2rem;
	}

	.field {
		margin-bottom: var(--spacing-16);
	}

	button {
		height: 2rem;
		padding: 0 1rem;
		background-color: var(--color-primary);
		color: var(--color-text-on-primary);
		font-size: var(--fs-base);
		font-weight: normal;
		float: right;
	}
</style>
