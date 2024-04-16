<script lang="ts">
	import Modal from '../lib/components/Modal.svelte'
	import LoginForm from '$lib/components/LoginForm.svelte'
	import SignupForm from '$lib/components/SignupForm.svelte'
	import { pushState } from '$app/navigation'
	import { page } from '$app/stores'
	import DollarNotoEmoji from '$lib/components/svgs/DollarNotoEmoji.svelte'
	import Header from '$lib/components/Header.svelte'
	import { setContext } from 'svelte'

	export let form

	function showModal(url: string) {
		pushState(url, {
			[url + 'Modal']: true
		})
	}

	setContext('showModal', showModal)
</script>

<section>
	<Header />
	<main>
		<div class="blur"></div>
		<div class="hero-title-container">
			<h1>Expense Tracking Made <span class="primary"> Simple </span></h1>
			<p>
				A modern expense tracker, With an intuitive interface and powerful features, Take control over how you manage
				your expenses
			</p>
			{#if !$page.data?.user}
				<button on:click={() => showModal('signup')}>Get Started</button>
			{:else}
				<a href="/app">Go To App</a>
			{/if}
		</div>
		<div class="hero-container">
			<DollarNotoEmoji />
		</div>
	</main>
	{#if $page.state?.loginModal}
		<Modal showModal onClose={() => history.back()}>
			<div class="form-container">
				<LoginForm {form} />
			</div>
		</Modal>
	{/if}

	{#if $page.state?.signupModal}
		<Modal showModal onClose={() => history.back()}>
			<div class="form-container">
				<SignupForm {form} />
			</div>
		</Modal>
	{/if}
</section>

<style>
	section {
		display: grid;
		grid-template-rows: auto 1fr;
		background-color: var(--color-background);
		min-height: 100vh;
	}

	main {
		display: flex;
		justify-content: space-between;

		margin-inline: 2rem;
		position: relative;
		overflow: hidden;

		background-color: var(--color-background);
		--c1: color-mix(in srgb, var(--color-text) 25%, var(--color-background));
		--c2: var(--color-background);
		background-image: linear-gradient(var(--c1) 1px, transparent 1px),
			linear-gradient(to right, var(--c1) 1px, var(--c2) 1px);
		background-size: 20px 20px;

		animation: bg 200s linear infinite alternate;

		& .blur {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			backdrop-filter: blur(0.3px);
			z-index: -1;
		}

		& p {
			color: var(--color-text-70);
			font-size: 1.1rem;
			line-height: 120%;
			max-width: 45ch;
		}
	}

	h1 {
		color: var(--color-text);
		font-size: 4rem;
		max-width: 16ch;
		margin-bottom: 1rem;
	}

	.hero-title-container {
		padding: 7rem 3rem;

		& button,
		a {
			background-color: var(--color-primary);
			color: var(--color-text-on-primary);
			display: inline-block;
			margin-top: 1rem;
			padding: 0.4rem 0.8rem;
			text-decoration: none;

			&:hover {
				filter: brightness(0.9);
			}
		}
	}

	.hero-container {
		padding: 1rem 3rem;
		width: clamp(150px, auto, 3000px);

		animation: hero 15s linear infinite alternate;
		& svg {
			filter: brightness(0.8);
		}
	}

	.form-container {
		height: 70vh;
		background-color: var(--color-primary);
		padding: 0 3rem;
		display: grid;
		place-content: center;
	}

	.primary {
		color: var(--color-primary);
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

	@media (max-width: 640px) {
		main {
			flex-direction: column;
			align-items: center;
		}

		.hero-title-container {
			text-align: center;
			padding-bottom: 0rem;
		}

		h1 {
			font-size: 3rem;
		}

		.hero-container {
			transform: scale(60%) translateY(-8rem);
		}
	}
</style>
