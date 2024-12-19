<script>
	import Sidebar from './(components)/Sidebar.svelte'
	/** @type {{children?: import('svelte').Snippet}} */
	let { children } = $props();
</script>

<div>
	<Sidebar />
	<main>
		{@render children?.()}
	</main>
</div>

<style>
	div {
		display: grid;
		grid-template-columns: minmax(320px, 25%) 1fr;
		height: 100dvh;
	}

	main {
		overflow-y: auto;
	}

	@media (max-width: 640px) {
		div {
			display: grid;
			grid-template-rows: auto 1fr;
			grid-template-columns: 1fr;
		}

		main {
			overflow-x: auto;
			overflow-y: unset;
		}
	}
</style>
