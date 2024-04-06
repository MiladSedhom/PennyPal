<script lang="ts">
	import { getContext } from 'svelte'
	import type { Writable } from 'svelte/store'
	import { slide } from 'svelte/transition'

	export let open = false
	const id = crypto.randomUUID()

	const colapse = getContext('colapse')
	const activeItemId: Writable<string | null> = getContext('activeItemId')

	colapse && open && ($activeItemId = id)
	$: isActive = $activeItemId === id
	$: colapse && (open = isActive)

	//function
	const toggleOpen = () => {
		open = !open
	}
	const setActiveId = () => {
		if (isActive) $activeItemId = null
		else $activeItemId = id
	}
	const handleClick = () => {
		if (colapse) setActiveId()
		else toggleOpen()
	}
</script>

<div class="accordion-item">
	<button on:click={handleClick} aria-expanded={open} aria-controls={`accordion-${id}`}>
		<div class="accordion-header">
			<slot name="header" />
			<svg
				class="caret"
				class:caret-closed={!open}
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 32 32"><path fill="currentColor" d="m24 12l-8 10l-8-10z" /></svg
			>
		</div>
	</button>
	{#if open}
		<div
			transition:slide={{ duration: 300 }}
			class="accordion-content"
			aria-labelledby={`accordion-${id}`}
			aria-hidden={!open}
			role="region"
		>
			<slot name="content" />
		</div>
	{/if}
</div>

<style>
	button {
		all: unset;
		width: 100%;
		cursor: pointer;
		margin-bottom: var(--header-margin-bottom, var(--spacing-24));

		&:hover {
			background-color: var(--accordion-hover, var(--color-hover));
		}
	}

	.accordion-item {
		width: var(--accordion-width, 100%);
		background-color: var(--accordion-background, var(--color-background));
		color: var(--accordion-color, var(--color-text));
	}

	.accordion-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.caret {
		color: var(--caret-color, var(--color-text-70));
		transition: transform 300ms ease-in;
	}
	.caret-closed {
		transform: rotate(-90deg);
	}
</style>
