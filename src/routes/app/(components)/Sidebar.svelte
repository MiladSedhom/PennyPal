<script lang="ts">
	import { page } from '$app/stores'
	import AddPaymentForm from './AddPaymentForm.svelte'
	import FiltersForm from './FiltersForm.svelte'
	import Modal from '$lib/components/Modal.svelte'
	import FiltesIcon from '$lib/components/svgs/FiltesIcon.svelte'
	import AddIcon from '$lib/components/svgs/AddIcon.svelte'
	import ThemeSwitchers from '$lib/components/ThemeSwitchers.svelte'
	import { slide } from 'svelte/transition'

	let isFilters: boolean
	let isAdd: boolean
</script>

<div class="wrapper">
	<aside>
		<div class="header">
			<span class="logo">
				<a href="/">
					<span class="primary">Penny</span>Pal
				</a>
			</span>
			<ThemeSwitchers />
			<div class="header-buttons small-only">
				<button
					on:click={() => {
						isFilters = !isFilters
					}}
				>
					<FiltesIcon width="20px" height="20px" />
				</button>
				<button
					on:click={() => {
						isAdd = true
					}}
				>
					<AddIcon width="20px" height="20px" />
				</button>
			</div>
			<div class="info">
				<p>{$page.data.user.username}</p>
				<a href="/logout">logout</a>
			</div>
		</div>

		{#key isFilters}
			<div class="form-container" class:large-only={!isFilters} transition:slide={{ duration: 300 }}>
				<h3>Choose Your Filters</h3>

				<FiltersForm />
			</div>
		{/key}
		<button
			class="add-btn large-only"
			on:click={() => {
				isAdd = true
			}}>Add Payment</button
		>

		{#if isAdd}
			<Modal
				showModal
				onClose={() => {
					isAdd = false
				}}
			>
				<AddPaymentForm
					onSubmit={() => {
						isAdd = false
					}}
				/>
			</Modal>
		{/if}
	</aside>

	<nav class="tabs-container">
		<ul>
			<li>
				<a href={`/app${$page.url.search}`} class:active-tab={$page.route.id === '/app'}>Payments view</a>
			</li>
			<li>
				<a href={`/app/graphs${$page.url.search}`} class:active-tab={$page.route.id === '/app/graphs'}>Graphs view</a>
			</li>
			<li>
				<a href={`/app/table${$page.url.search}`} class:active-tab={$page.route.id === '/app/table'}>Table view</a>
			</li>
		</ul>
	</nav>
</div>

<style>
	.wrapper {
		height: 100vh;
		border-right: 2px solid var(--color-background);
	}

	aside {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: calc(100vh - 42px);
		padding: calc(var(--spacing-32) - var(--scrollbar-width));
		scrollbar-gutter: stable both-edges;
		background-color: var(--color-background);
		color: var(color-text);
		overflow: auto;
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.header .info {
		display: flex;
		flex-flow: column;
		align-items: end;
		padding-top: 0.25rem;

		& p {
			font-size: var(--fs-small);
			color: var(--color-text-90);
		}

		& a {
			font-size: var(--fs-small);
			color: var(--color-text-70);
		}
	}

	.header button {
		background-color: transparent;
	}

	.header-buttons {
		display: flex;
		& button {
			padding: 0.2rem;
		}

		& button:hover {
			outline: 1px solid var(--color-primary);
		}
	}

	.logo {
		display: inline-block;
		font-size: 1.5rem;
		font-family: var(--serif);
		font-weight: bold;

		& a {
			color: var(--color-text);
			text-decoration: none;
		}

		& .primary {
			color: var(--color-primary);
		}
	}

	h3 {
		font-size: var(--fs-base);
		font-weight: 400;
		margin-block: 1rem 0.5rem;
	}

	.form-container {
		margin-bottom: 2rem;
	}

	.add-btn {
		padding: 0.5rem 1rem;
		background-color: var(--color-primary);
		color: var(--color-text-on-primary);
	}

	nav {
		width: 100%;
		margin-inline: auto;
		background-color: var(--color-background);

		& ul {
			width: 100%;
			display: flex;
			gap: 2px;
			padding-bottom: 2px;
		}

		& li {
			width: 100%;
		}

		& a {
			display: grid;
			place-content: center;
			width: 100%;
			height: 40px;
			padding: 4px;
			background-color: var(--color-background-1);
			color: var(--color-text-60);
			font-size: var(--fs-small);
			font-weight: 500;
			text-decoration: none;
		}

		& a.active-tab {
			background-color: var(--color-background-2);
			color: var(--color-text);
			border-bottom: 2px solid var(--color-primary);
		}
	}

	.small-only {
		display: none;
	}

	@media (max-width: 640px) {
		.wrapper {
			height: auto;
		}

		aside {
			height: auto;
			padding-inline: calc(var(--spacing-16) - var(--scrollbar-width));
		}

		.large-only {
			display: none;
		}

		.small-only {
			display: block;
		}
	}
</style>
