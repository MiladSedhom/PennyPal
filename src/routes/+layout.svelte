<script lang="ts">
	import '../global.css'
</script>

<main>
	<slot />
</main>

<style>
	:global(.error) {
		color: tomato;
	}
	:global(a) {
		color: white;
	}
</style>
