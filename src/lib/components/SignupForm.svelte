<script lang="ts">
	import { applyAction, enhance } from '$app/forms'

	export let form: any
</script>

<form
	action="/signup?/signup"
	method="post"
	class="bg-primary w-120 flex h-full flex-col items-center justify-center p-4"
	use:enhance={() => {
		return async ({ result, update }) => {
			await applyAction(result)
		}
	}}
>
	<h3 class="text-8 text-text-alt font-600 font-[var(--serif)]">Hello There👋🏻</h3>
	<p class="text-14px text-text-alt m-b-2 fw-500">Create your account</p>

	<input
		class="text-14px rounded-1 fw-500 placeholder:text-text-alt/60 border-text-alt w-90% bg-fields/20 interactions-ring-text-alt/30,text-alt/60 text-text-alt h-12 border border-2 p-4"
		type="text"
		name="username"
		id="username"
		placeholder="Username"
		autocomplete="off"
	/>
	{#if form?.errors?.username}
		<p class="error">{form.errors.username[0]}</p>
	{/if}
	<div class="h-4"></div>
	<input
		class="text-14px rounded-1 fw-500 placeholder:text-text-alt/60 border-text-alt w-90% bg-fields/20 interactions-ring-text-alt/30,text-alt/60 text-text-alt h-12 border border-2 p-4"
		type="password"
		name="password"
		id="password"
		placeholder="Password"
	/>
	{#if form?.errors?.password}
		<p class="error">{form.errors.password[0]}</p>
	{/if}
	<div class="h-6"></div>

	<button
		class="bg-bg text-primary fw-500 rounded-1 hover:(filter-brightness-110) active:(filter-brightness-85) disabled:bg-muted focus:(outline-primary outline-offset-3 outline) w-90% h-12 outline-none outline-2"
		type="submit">Sign up</button
	>
	<div class="h-4"></div>

	<a class="decoration-underline text-13px text-text-alt/80 fw-500 underline-offset-2" href="/login/github">
		<div class="i-tabler-brand-github text-5"></div>
		Sign up with github
	</a>

	<span class="text-13px text-text-alt/80 fw-500">
		Already have an account?
		<a class="decoration-underline underline-offset-2" href="/signup">Log in</a>
	</span>
</form>
