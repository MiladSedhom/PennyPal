<script lang="ts">
	import { applyAction, enhance } from '$app/forms'
	import type { SubmitFunction } from '../$types'
	import { page } from '$app/stores'
	import Select from '$lib/components/Select.svelte'
	import DatePicker from './DatePicker.svelte'
	import { CalendarDate } from '@internationalized/date'

	export let onSubmit: Function | null = null
	export let action: string
	export let initialPaymentData: any = undefined
	export let submitButtonText = 'Submit'

	let loading: boolean = false

	let selectedTags: string[] = initialPaymentData?.tags ?? []
	const options = $page.data.tags.map((o: string) => ({ label: o, value: o }))

	let initialDate = initialPaymentData?.createdAt ?? new Date()
	let dateValue = new CalendarDate(initialDate.getFullYear(), initialDate.getMonth() + 1, initialDate.getDate())

	const submitter: SubmitFunction = async ({ formData }) => {
		loading = true
		await new Promise((r) => setTimeout(r, 2000))
		formData.set('date', dateValue.toString())
		return async ({ update, result }) => {
			applyAction(result)
			loading = false
			if (result.type === 'success') {
				onSubmit?.()
			}
			await update()
			$page.form = {}
		}
	}
</script>

<form {action} method="post" use:enhance={submitter} class="rounded-1 border-primary min-h-80% bg-bg border-2 p-8">
	<label class="text-3 text-text-90 m-b-1.5 block select-none" for="amount">Amount</label>
	<input
		class="text-14px rounded-1 placeholder:text-text-70 bg-fields hover:(outline outline-grey-2) focus:(outline-primary outline) outline-offset-3 h-12 w-full p-4 outline-2"
		type="number"
		name="amount"
		id="amount"
		placeholder="amount"
		value={initialPaymentData?.amount}
	/>
	{#if $page.form?.errors?.amount}
		<p class="text-3 text-error">{$page.form.errors.amount}</p>
	{/if}
	<div class="m-b-4"></div>

	<label class="text-3 text-text-90 m-b-1.5 block select-none" for="tags">Tags</label>
	<Select name="tags" id="tags" bind:value={selectedTags} multiple {options} />
	{#if $page.form?.errors?.tags}
		<div class="text-3 text-error">{$page.form.errors.tags[0]}</div>
	{/if}
	<div class="m-b-4"></div>

	<DatePicker bind:value={dateValue} />
	{#if $page.form?.errors?.date}
		<div class="text-3 text-error">{$page.form.errors.date}</div>
	{/if}
	<div class="m-b-4"></div>

	<label class="text-3 text-text-90 m-b-1.5 block select-none" for="note">Note</label>
	<textarea
		class="bg-fields rounded-1 min-h-18 hover:(outline outline-grey-2) focus:(outline-primary outline) outline-offset-3 text-3 max-h-24 w-full p-2 outline-2"
		name="note"
		id="note"
		value={initialPaymentData?.note ?? ''}
	/>
	{#if $page.form?.errors?.note}
		<p class="text-3 text-error">{$page.form.errors.note}</p>
	{/if}
	<div class="m-b-4"></div>

	<button
		class="bg-primary text-text-alt fw-500 rounded-1 hover:(filter-brightness-110) active:(filter-brightness-85) disabled:bg-muted focus:(outline-primary outline-offset-3 outline) h-12 w-full outline-none outline-2"
		type="submit"
		class:loading
		disabled={loading}
	>
		{#if !loading}
			{submitButtonText}
		{:else}
			<span class="i-tabler-fidget-spinner text-5 animate-spin"></span>
			Loading
		{/if}
	</button>
</form>
