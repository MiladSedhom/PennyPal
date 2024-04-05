<script lang="ts">
	import { enhance } from '$app/forms'
	import { makeHorizontalScrollableWithWheel } from '$lib/actions/makeHorizontalScrollableWithWheel'
	import type { Payment } from '@prisma/client'
	import IcRoundEdit from '$lib/components/svgs/IcRoundEdit.svelte'
	import IcRoundDelete from '$lib/components/svgs/IcRoundDelete.svelte'
	import { goto } from '$app/navigation'
	import { fade, slide } from 'svelte/transition'
	import { onMount } from 'svelte'

	export let payment: Payment & { tags: string[] }
	export let selected: boolean = false
	export let showButtons: boolean = true

	let tagsHeight: number = 0
	let noteHeight: number = 0
	let cardPreferredheight: number = 0

	// TODO?: this masnory logic can be abstracted
	// cardPreferredheight = padding + head + internal gaps + tagsHeight + noteHeight + potential extra row if date wraps
	onMount(() => (cardPreferredheight = 32 + 32 + 32 + tagsHeight + noteHeight + 16))
	// s = h / ( r + g )
	$: rowsSpan = Math.ceil(cardPreferredheight / (16 + 16))

	$: {
		rowsSpan && console.log(payment.amount, cardPreferredheight, rowsSpan)
	}
</script>

<div
	class="card"
	class:selected
	style="--rows-span: {rowsSpan}"
	class:card-spanned={rowsSpan}
	on:click
	on:dblclick={() => {
		goto(`/app/payment/${payment.id}`)
	}}
	on:keydown
	role="button"
	tabindex="0"
	transition:fade={{ duration: 3000 }}
>
	<div class="head">
		<span class="amount">{payment.amount}</span>
		{#if showButtons}
			<div class="buttons-container">
				<form action="?/removePayment" method="post" use:enhance>
					<input type="hidden" name="id" value={payment.id} />
					<button class="remove-btn" on:click|stopPropagation={() => {}}>
						<IcRoundDelete width="20" height="20" />
					</button>
				</form>
				<button class="edit-btn">
					<a href={`/app/payment/${payment.id}`}>
						<IcRoundEdit width="20" height="20" />
					</a>
				</button>
			</div>
		{/if}
	</div>
	<div class="details-container">
		<div class="tags-container" bind:clientHeight={tagsHeight}>
			{#each payment.tags as tag}
				<span class="tag"> {tag} </span>
			{/each}
		</div>
		{#if payment.note}
			<span class="note" bind:clientHeight={noteHeight} title={payment.note}>{payment.note ? payment.note : ''}</span>
		{/if}
		<span class="date">{new Date(payment.createdAt).toLocaleDateString()}</span>
	</div>
</div>

<style>
	.card {
		width: 320px;
		padding: 1rem var(--spacing-32);
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;

		background-color: var(--color-background);
		color: var(color-text);
		border-radius: 2px;
		/* box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25); */

		&:hover {
			background-color: color-mix(in srgb, var(--color-background) 97%, var(color-text));
		}
	}

	.card-spanned {
		grid-row-end: span var(--rows-span, 10);
	}

	.head {
		flex-basis: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.details-container {
		display: flex;
		flex-flow: wrap;
		justify-content: space-between;
		align-items: center;
		flex-grow: 1;
		gap: 0.5rem;
		overflow: hidden;
	}

	.card.selected {
		outline: 2px solid var(--color-primary);
	}

	.amount {
		font-size: 1.5rem;
		font-weight: 500;
	}

	.date {
		font-size: 11px;
	}

	.tags-container {
		flex-grow: 1;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--spacing-8);
		background-color: transparent;

		&::-webkit-scrollbar-thumb {
			height: 1px;
			background-color: color-mix(in srgb, var(--color-white) 20%, transparent);
		}
	}

	.tag {
		background-color: var(--color-primary);
		color: var(--color-text-on-primary);
		padding: 4px var(--spacing-16);
		border-radius: 4px;
		text-align: center;
		white-space: nowrap;

		font-size: 14px;
		font-weight: 500;
	}

	.note {
		font-size: 12px;
		font-weight: 400;
		color: color-mix(in srgb, var(color-text) 80%, transparent);
		max-width: 46ch;
		flex-grow: 1;
	}

	.buttons-container {
		display: flex;
		gap: 2px;
	}

	button {
		width: 2rem;
		height: 2rem;
		border-radius: 2px;
		background-color: transparent;
		color: var(--color-text-60);

		& a {
			color: var(--color-text-60);
		}
	}

	.remove-btn:hover {
		color: var(--color-semantic-red);
		background-color: color-mix(in srgb, var(--color-background) 90%, white);
	}

	.edit-btn:hover {
		background-color: color-mix(in srgb, var(--color-background) 90%, white);
	}
</style>
