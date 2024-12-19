<script lang="ts">
	import { setContext } from 'svelte'
	import { writable, type Writable } from 'svelte/store'

	interface Props {
		colapse?: boolean;
		children?: import('svelte').Snippet;
	}

	let { colapse = false, children }: Props = $props();
	const activeItemId: Writable<string | null> = writable(null)

	setContext('activeItemId', activeItemId)
	setContext('colapse', colapse)
</script>

<div class="accordion">
	{@render children?.()}
</div>

<style>
	.accordion {
		width: var(--accordion-width, 100%);
		background-color: var(--accordion-background, --color-background);
		color: var(--accordion-color, --color-text);
	}
</style>
