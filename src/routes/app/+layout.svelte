<script>
	import Sidebar from './Sidebar.svelte'
</script>

<div>
	<Sidebar />
	<main>
		<slot />
	</main>
</div>

<style>
	div {
		display: grid;
		grid-template-columns: auto 1fr;
	}
</style>
