<script>
	import Sidebar from './(components)/Sidebar.svelte'
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

	main {
		max-height: 100vh;
		overflow: auto;
	}
</style>
