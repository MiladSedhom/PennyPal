<script>
	import { page } from '$app/stores'
	import Sidebar from './Sidebar.svelte'
</script>

<div>
	<Sidebar />
	<main>
		<slot />
		<pre>
			{JSON.stringify($page, null, 2)}
		</pre>
	</main>
</div>

<style>
	div {
		display: grid;
		grid-template-columns: auto auto;
	}
</style>
