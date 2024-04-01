<script lang="ts">
	import { page } from '$app/stores'
	import { Accordion, AccordionItem } from '$lib/components/Accordion'
	import AddPaymentForm from './AddPaymentForm.svelte'
	import FiltersForm from './FiltersForm.svelte'
</script>

<aside>
	<div class="header">
		<span class="logo">
			<a href="/">
				<span class="primary">Penny</span>Pal
			</a>
		</span>
		<div>
			<p>{$page.data.user.username}</p>
			<a href="logout">logout</a>
		</div>
	</div>
	<div class="forms-container">
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
</aside>

<style>
	aside {
		display: flex;
		flex-direction: column;
		width: 20rem;
		min-width: 20rem;
		height: 100vh;
		flex-grow: 1;
		padding: calc(var(--spacing-32) - var(--scrollbar-width));
		scrollbar-gutter: stable both-edges;
		background-color: var(--color-dark);
		color: var(--color-text-alt);
		color-scheme: dark;
		overflow: auto;
		/* scrollbar-gutter: stable both-edges; */
		position: relative;
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--spacing-32);

		& div {
			display: flex;
			flex-flow: column;
			align-items: end;
			padding-top: 0.25rem;

			& p {
				font-size: var(--fs-small);
				color: var(--color-grey-90);
			}

			& a {
				font-size: var(--fs-small);
				color: var(--color-grey-70);
			}
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

	nav {
		width: 100%;
		margin-inline: auto;
		position: absolute;
		bottom: 0;
		left: 0;

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
			background-color: var(--color-dark-1);
			color: var(--color-grey-60);
			font-size: var(--fs-small);
			font-weight: 500;
			text-decoration: none;
		}

		& a.active-tab {
			background-color: var(--color-dark-2);
			color: var(--color-text-alt);
			border-bottom: 2px solid var(--color-primary);
		}
	}
</style>
