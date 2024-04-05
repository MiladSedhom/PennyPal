<script lang="ts">
	import { page } from '$app/stores'
	import { Accordion, AccordionItem } from '$lib/components/Accordion'
	import AddPaymentForm from './AddPaymentForm.svelte'
	import FiltersForm from './FiltersForm.svelte'
	import More from '$lib/components/svgs/More.svelte'
	import { slide } from 'svelte/transition'

	let isForms = false
</script>

<div class="wrapper">
	<aside>
		<div class="header">
			<span class="logo">
				<a href="/">
					<span class="primary">Penny</span>Pal
				</a>
			</span>
			<button
				class="small-only"
				on:click={() => {
					isForms = !isForms
				}}
			>
				<More width="1.5rem" height="1.5rem" />
			</button>
			<div>
				<p>{$page.data.user.username}</p>
				<a href="/logout">logout</a>
			</div>
		</div>
		{#key isForms}
			<div class="forms-container" class:large-only={!isForms} transition:slide={{ duration: 300 }}>
				<Accordion colapse>
					<AccordionItem open>
						<h3 slot="header">Choose Your Filters</h3>
						<div slot="content">
							<FiltersForm />
						</div>
					</AccordionItem>

					<AccordionItem>
						<h3 slot="header">Add A New Payment</h3>
						<div slot="content">
							<AddPaymentForm />
						</div>
					</AccordionItem>
				</Accordion>
			</div>
		{/key}
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
	}

	aside {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: calc(100vh - 40px);
		flex-grow: 1;
		padding: calc(var(--spacing-32) - var(--scrollbar-width));
		scrollbar-gutter: stable both-edges;
		background-color: var(--color-background);
		color: var(--color-text-alt);
		overflow: auto;
		/* scrollbar-gutter: stable both-edges; */
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;

		& div {
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

		& button {
			background-color: transparent;
		}
	}

	.logo {
		display: inline-block;
		font-size: 1.5rem;
		font-family: var(--serif);
		font-weight: bold;

		& a {
			text-decoration: none;
		}

		& .primary {
			color: var(--color-primary);
		}
	}

	h3 {
		font-size: var(--fs-base);
		font-weight: 400;
	}

	.forms-container {
		margin-top: var(--spacing-32);
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
			color: var(--color-text-alt);
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
		}

		.large-only {
			display: none;
		}

		.small-only {
			display: block;
		}
	}
</style>
