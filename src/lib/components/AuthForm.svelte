<script lang="ts">
	import { applyAction, enhance } from '$app/forms'
	import { goto } from '$app/navigation'
	import type { SubmitFunction } from '@sveltejs/kit'

	export let form
	export let action
	export let buttonText

	let loading = false

	const submitter: SubmitFunction = () => {
		loading = true
		return async ({ result }) => {
			loading = false
			await applyAction(result)
		}
	}

	const inputHandler = () => {
		if (form?.error) form.error = null
	}
</script>

<form
	{action}
	method="post"
	class="bg-primary flex w-full grow flex-col items-center justify-center"
	use:enhance={submitter}
>
	<input
		class="text-14px rounded-1 fw-500 placeholder:text-text-alt/60 border-text-alt w-90% bg-fields/20 interactions-ring-text-alt/30,text-alt/60 text-text-alt h-12 border border-2 p-4"
		type="text"
		name="username"
		id="username"
		placeholder="Username"
		autocomplete="off"
		on:input={inputHandler}
	/>

	<div class="h-4"></div>
	<input
		class="text-14px rounded-1 fw-500 placeholder:text-text-alt/60 border-text-alt w-90% bg-fields/20 interactions-ring-text-alt/30,text-alt/60 text-text-alt h-12 border border-2 p-4"
		type="password"
		name="password"
		id="password"
		placeholder="Password"
		on:input={inputHandler}
	/>

	<div class="h-6"></div>

	<button
		class="bg-text-alt text-primary fw-500 rounded-1 hover:not:disabled:(filter-brightness-110) active:not:disabled:(filter-brightness-85) disabled:(cursor-not-allowed) focus:(outline-primary outline-offset-3 outline) w-90% h-12 outline-none outline-2"
		type="submit"
		disabled={loading || !!form?.error}
	>
		{#if form?.error}
			<p class="text-red-4 animate-head-shake">
				{form.error}
			</p>
		{:else}
			{#if loading}
				<span class="i-tabler-fidget-spinner text-5 animate-spin"></span>
			{/if}
			{buttonText}
		{/if}
	</button>
</form>
