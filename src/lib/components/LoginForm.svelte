<script lang="ts">
	import { getContext } from 'svelte'
	import AuthForm from './AuthForm.svelte'

	export let form
	const showModal: (modal: 'login' | 'signup') => void = getContext('authModals')
</script>

<div class="bg-primary w-120 flex h-full flex-col items-center justify-center p-4">
	<h3 class="text-8 text-text-alt font-600 font-[var(--serif)]">Welcome back💰</h3>
	<p class="text-14px text-text-alt m-b-2 fw-500">Log in to your account</p>

	<AuthForm {form} action="/login?/login" buttonText="Log in" />

	<div class="h-4"></div>

	<a class="text-text-alt/80 fw-500 decoration-underline text-13px underline-offset-2" href="/login/github">
		<div class="i-tabler-brand-github text-5"></div>
		Login with github
	</a>

	<span class="text-text-alt/80 fw-500 text-13px">
		Don't have an account?
		<button class="decoration-underline underline-offset-2" type="button" on:click={() => showModal('signup')}>
			Sign up</button
		>
	</span>
</div>
