<script lang="ts">
	import { page } from '$app/stores'
	import '../global.css'

	export let data
</script>

<main>
	<slot />
</main>

<pre>
	{JSON.stringify($page, null, 2)}
</pre>

<style>
	:global(.error) {
		color: tomato;
	}
	:global(a) {
		color: white;
	}
</style>
