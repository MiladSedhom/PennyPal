<script lang="ts">
	import { enhance } from '$app/forms'
	import { makeHorizontalScrollableWithWheel } from '$lib/actions/makeHorizontalScrollableWithWheel'
	import type { Payment } from '@prisma/client'
	import IcRoundEdit from '$lib/components/svgs/IcRoundEdit.svelte'
	import IcRoundDelete from '$lib/components/svgs/IcRoundDelete.svelte'
	import { goto } from '$app/navigation'

	export let payment: Payment & { tags: string[] }
	export let selected: boolean = false
	export let showButtons: boolean = true
</script>

<div
	class="card"
	class:selected
	on:click
	on:dblclick={() => {
		goto(`/app/payment/${payment.id}`)
	}}
	on:keydown
	role="button"
	tabindex="0"
>
	<span class="amount">{payment.amount}</span>
	<div class="details-container">
		<span class="note" title={payment.note}>{payment.note ? payment.note : ''}</span>
		<div class="tags-container" use:makeHorizontalScrollableWithWheel>
			{#each payment.tags as tag}
				<span class="tag"> {tag} </span>
			{/each}
		</div>
		<span class="date">{new Date(payment.createdAt).toLocaleDateString()}</span>
	</div>
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

<style>
	.card {
		width: clamp(320px, 90%, 909px);
		max-width: 909px;
		min-height: 4rem;
		padding-inline: var(--spacing-32);
		display: flex;
		align-items: center;
		gap: 3rem;
		background-color: var(--color-dark);
		color: var(--color-text-alt);
		border-radius: 2px;

		position: relative;

		/* box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25); */

		&:hover {
			background-color: color-mix(in srgb, var(--color-dark) 97%, var(--color-text-alt));
		}
	}

	.card.selected {
		outline: 2px solid var(--color-primary);
	}

	.details-container {
		display: flex;
		align-items: center;
		flex-grow: 1;
		justify-content: end;
		gap: 2rem;
		overflow: hidden;
	}

	.amount {
		font-size: 1.5rem;
		font-weight: 500;
	}

	.date {
		font-size: 11px;
	}

	.tags-container {
		display: flex;
		align-items: center;
		gap: var(--spacing-8);
		flex-shrink: 1;
		overflow: auto;
		padding: 0.4rem 0;
		scrollbar-gutter: stable both-edges;
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
		border-radius: 1rem;
		text-align: center;
		white-space: nowrap;

		font-size: 14px;
		font-weight: 500;
	}

	.note {
		font-size: 12px;
		font-weight: 400;
		color: color-mix(in srgb, var(--color-text-alt) 80%, transparent);
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
		max-width: 30%;
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
		color: var(--color-grey-60);

		& a {
			color: var(--color-grey-60);
		}
	}

	.remove-btn:hover {
		color: var(--color-semantic-red);
		background-color: color-mix(in srgb, var(--color-dark) 90%, white);
	}

	.edit-btn:hover {
		background-color: color-mix(in srgb, var(--color-dark) 90%, white);
	}
</style>
