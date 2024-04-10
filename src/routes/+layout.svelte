<script lang="ts">
	import { writable } from 'svelte/store'
	import '../global.css'
	import { setContext } from 'svelte'

	export let data

	const theme = writable(data.theme)
	setContext('theme', theme)
</script>

<div class={`theme ${$theme} ${data.color} `}>
	<main>
		<slot />
	</main>
</div>

<style>
	div {
		width: 100%;
		height: 100%;
		background-color: var(--color-body);
		color: var(--color-text);
	}

	:global(.error) {
		color: tomato;
		font-size: var(--fs-base);
	}
	:global(a) {
		color: white;
	}
</style>
