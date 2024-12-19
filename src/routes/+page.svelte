<script lang="ts">
	import Modal from '../lib/components/Modal.svelte'
	import LoginForm from '$lib/components/LoginForm.svelte'
	import SignupForm from '$lib/components/SignupForm.svelte'
	import { page } from '$app/stores'
	import DollarNotoEmoji from '$lib/components/svgs/DollarNotoEmoji.svelte'
	import Header from '$lib/components/Header.svelte'
	import { setContext } from 'svelte'

	interface Props {
		form: any;
	}

	let { form = $bindable() }: Props = $props();
	let loginModal = $state(false)
	let signupModal = $state(false)

	function showModal(modal: 'login' | 'signup') {
		form = null
		if (modal === 'login') {
			signupModal = false
			loginModal = true
		}
		if (modal === 'signup') {
			loginModal = false
			signupModal = true
		}
	}

	setContext('authModals', showModal)
</script>

<section class="bg-bg min-h-100vh grid grid-rows-[auto_1fr]">
	<Header />
	<main
		class="bg-animation m-x-8 pos-relative bg-bg md:(flex-row items-center) flex flex-col justify-center overflow-hidden bg-[linear-gradient(hsl(var(--color-grey)),transparent_1px),linear-gradient(to_right,hsl(var(--color-grey))_1px,hsl(var(--color-background))_1px)] bg-[length:20px_20px]
		"
	>
		<div class="p-x-28 p-t-20 md:(p-b-20 text-left) text-center">
			<h1 class="text-text text-12 md:text-16 font-700 max-w-16ch line-height-100% m-b-4 font-[var(--serif)]">
				Expense Tracking Made <span class="text-primary"> Simple </span>
			</h1>
			<p class="text-text/70 text-4 line-height-140% max-w-45ch m-b-4">
				A modern expense tracker, With an intuitive interface and powerful features, Take control over how you manage
				your expenses
			</p>
			{#if !$page.data?.user}
				<button class="rounded-1 bg-primary text-text-alt m-t-4 p-x-1 p-y-1" onclick={() => (signupModal = true)}
					>Get Started</button
				>
			{:else}
				<a class="rounded-1 bg-primary text-text-alt m-t-4 decoration-none line-height-12 p-x-4 p-y-2" href="/app "
					>Go To App</a
				>
			{/if}
		</div>
		<div
			class="hero-animation scale-60 translate-y--8rem md:(scale-100 translate-y-0) p-x-4 p-y-12 w-[clamp(150px,auto,3000px)]"
		>
			<DollarNotoEmoji class="brightness-80" />
		</div>
	</main>

	<Modal bind:showModal={loginModal}>
		<div class="h-70vh rounded-1 bg-primary p-y-12 grid place-content-center">
			<LoginForm {form} />
		</div>
	</Modal>

	<Modal bind:showModal={signupModal}>
		<div class="h-70vh rounded-1 bg-primary p-y-12 grid place-content-center">
			<SignupForm {form} />
		</div>
	</Modal>
</section>

<style>
	.bg-animation {
		animation: bg 200s linear infinite alternate;
	}

	.hero-animation {
		animation: hero 15s linear infinite alternate;
	}

	@keyframes bg {
		0% {
			background-position: 0 0;
		}

		100% {
			background-position: 10% 100%;
		}
	}

	@keyframes hero {
		0% {
			rotate: -21deg;
			translate: -1% 2%;
		}
		50% {
			rotate: 0deg;
		}

		100% {
			rotate: 15deg;
			translate: 1% -2%;
		}
	}
</style>
