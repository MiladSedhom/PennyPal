<script lang="ts">
	import { makeHorizontalScrollableWithWheel } from '$lib/actions/makeHorizontalScrollableWithWheel'
	export let payment: any
	export let selected: boolean

	const deleteButtonHandler = async () => {}
</script>

<div class="card" class:selected on:click on:keydown role="button" tabindex="0">
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
	<button class="remove-btn" on:click={deleteButtonHandler}
		><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
			><path
				fill="currentColor"
				d="M20 6.91L17.09 4L12 9.09L6.91 4L4 6.91L9.09 12L4 17.09L6.91 20L12 14.91L17.09 20L20 17.09L14.91 12L20 6.91Z"
			/></svg
		></button
	>
</div>

<style>
	.card {
		width: clamp(320px, 90%, 909px);
		max-width: 909px;
		height: 4rem;
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
		background-color: var(--color-dark);

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

	.remove-btn {
		width: 24px;
		height: 24px;
		position: absolute;
		top: 0;
		right: 0;
		translate: 100%;
		border-radius: 2px;
		background-color: var(--color-semantic-red);
		color: var(--color-text-alt);
		display: none;
	}

	.card:hover .remove-btn {
		display: grid;
		place-content: center;
	}
</style>
