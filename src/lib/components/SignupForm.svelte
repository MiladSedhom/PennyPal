<script lang="ts">
	import { getContext } from 'svelte'
	import AuthForm from './AuthForm.svelte'

	interface Props {
		form: any;
	}

	let { form }: Props = $props();
	const showModal: (modal: 'login' | 'signup') => void = getContext('authModals')
</script>

<div class="bg-primary w-120 rounded-1 flex h-full flex-col items-center justify-center p-4">
	<h3 class="text-8 text-text-alt font-600 font-[var(--serif)]">Hello There👋🏻</h3>
	<p class="text-14px text-text-alt m-b-2 fw-500">Create your account</p>

	<AuthForm {form} action="/signup?/register" buttonText="Sign up" />
	<div class="h-4"></div>

	<a
		class="decoration-underline text-13px focus:(outline outline-text-alt outline-2) rounded-1 text-text-alt/80 fw-500 underline-offset-2"
		href="/login/github"
	>
		<div class="i-tabler-brand-github text-5"></div>
		Sign up with github
	</a>

	<span class="text-13px text-text-alt/80 fw-500">
		Already have an account?
		<button
			class="decoration-underline focus:(outline outline-text-alt outline-2) rounded-1 underline-offset-2"
			type="button"
			onclick={() => showModal('login')}>Log in</button
		>
	</span>
</div>
