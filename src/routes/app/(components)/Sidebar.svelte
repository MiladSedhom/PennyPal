<script lang="ts">
	import { Accordion, AccordionItem } from '$lib/components/Accordion'
	import AddPaymentForm from './AddPaymentForm.svelte'
	import FiltersForm from './FiltersForm.svelte'
</script>

<aside>
	<span class="logo"><span class="primary">Penny</span>Pal</span>
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

	.logo {
		display: inline-block;
		font-size: 1.5rem;
		font-family: var(--serif);
		font-weight: bold;
		margin-bottom: var(--spacing-32);

		& .primary {
			color: var(--color-primary);
		}
	}

	h3 {
		font-size: var(--fs-base);
		font-weight: 400;
	}
</style>
