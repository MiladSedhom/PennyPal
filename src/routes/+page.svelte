<script lang="ts">
	import Modal from '../lib/components/Modal.svelte'
	import LoginForm from '$lib/components/LoginForm.svelte'
	import SignupForm from '$lib/components/SignupForm.svelte'
	import { pushState } from '$app/navigation'
	import { page } from '$app/stores'

	export let form
	// let showModal = true

	function showModal(url: string) {
		pushState(url, {
			[url + 'Modal']: true
		})
	}
</script>

<section>
	<header>
		<span class="logo"><span class="primary">Penny</span>Pal</span>
		<nav>
			{#if !$page.data.user}
				<button on:click={() => showModal('login')}>Login</button>
				<button on:click={() => showModal('signup')}>Signup</button>
			{:else if $page.data.user}
				<p>{$page.data.user.username}</p>
				<a href="/app">App</a>
				<a href="/logout">Logout</a>
			{/if}
		</nav>
		<div class="border-bot"></div>
	</header>

	<main>
		<div>
			<h1>Expense Tracking Made <span class="primary"> Simple </span></h1>
			<p>
				A modern expense tracker, With an intuitive interface and powerful features, Take control over how you manage
				your expenes
			</p>
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

	<pre>{JSON.stringify($page, null, 2)}</pre>
</section>

<style>
	section {
		display: grid;
		grid-template-areas:
			'header'
			'main';
		grid-template-rows: auto auto;
	}

	header {
		grid-area: header;
		height: 5rem;

		padding: 0 3rem;
		background-color: var(--color-dark);
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: relative;

		& .logo {
			display: inline-block;
			font-size: 1.5rem;
			font-family: var(--serif);
			font-weight: bold;
		}

		& nav {
			display: flex;
			gap: 0.5rem;

			& p {
				align-self: center;
				padding: 0.4rem 0;
				padding-right: 1rem;
				border-right: 1px solid grey;
				font-size: var(--fs-base);
				color: var(--color-grey-70);
			}
		}

		& button,
		a {
			padding: 0.4rem 0.5rem;
			background-color: transparent;
			color: var(--color-text);
			font-size: var(--fs-base);
			font-weight: 500;
			text-decoration: none;

			&:hover {
				color: var(--color-primary);
				text-decoration: underline;
			}
		}

		& .border-bot {
			width: calc(100% - 6rem);
			position: absolute;
			bottom: 0;
			left: 50%;
			translate: -50%;
			border-bottom: 1px solid color-mix(in srgb, var(--color-text) 20%, var(--color-dark));
		}
	}

	main {
		padding: 7rem var(--spacing-48);

		background-color: var(--color-dark);
		height: 100vh;

		& h1 {
			font-size: 4rem;
			max-width: 16ch;
			margin-bottom: 1rem;
		}

		& p {
			color: var(--color-grey-70);
			font-size: 1.1rem;
			line-height: 120%;
			max-width: 45ch;
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
</style>
