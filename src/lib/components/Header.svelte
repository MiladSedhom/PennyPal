<script lang="ts">
	import ThemeSwitchers from '$lib/components/ThemeSwitchers.svelte'
	import { page } from '$app/stores'
	import { getContext } from 'svelte'

	const showModal: Function = getContext('showModal')
</script>

<header>
	<span class="logo"><span class="primary">Penny</span>Pal</span>
	<nav>
		<ThemeSwitchers />
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

<style>
	header {
		height: 5rem;

		padding: 0 3rem;
		background-color: var(--color-background);
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: relative;

		& .logo {
			display: inline-block;
			font-size: 1.5rem;
			font-family: var(--serif);
			font-weight: bold;
			color: var(--color-text);
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
				color: var(--color-text-70);
			}
		}

		& .border-bot {
			width: calc(100% - 6rem);
			position: absolute;
			bottom: 0;
			left: 50%;
			translate: -50%;
			border-bottom: 1px solid color-mix(in srgb, var(--color-text) 30%, var(--color-background));
		}
	}

	header button,
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

	.primary {
		color: var(--color-primary);
	}
</style>
