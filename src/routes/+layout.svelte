<script lang="ts">
	import '../global.css'
</script>

<main>
	<slot />
</main>

<style>
	:global(.error) {
		color: tomato;
		font-size: var(--fs-base);
	}
	:global(a) {
		color: white;
	}
</style>
