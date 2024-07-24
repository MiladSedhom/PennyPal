<script lang="ts">
	import { writable } from 'svelte/store'
	import 'virtual:uno.css'
	import '../global.css'
	import { setContext } from 'svelte'

	export let data

	const theme = writable(data.theme)
	setContext('theme', theme)
</script>

<div class={`theme ${$theme} ${data.color} bg-body text-text `}>
	<main>
		<slot />
	</main>
</div>
