<script lang="ts">
	import { setContext } from "svelte"
	import { writable, type Writable } from "svelte/store"

	export let colapse = false
	const activeItemId: Writable<string | null> = writable(null)

	setContext("activeItemId", activeItemId)
	setContext("colapse", colapse)
</script>

<div class="accordion">
	<slot />
</div>

<style>
	.accordion {
		width: var(--accordion-width, 100%);
		background-color: var(--accordion-background, --color-dark);
		color: var(--accordion-color, --color-text-alt);
	}
</style>
