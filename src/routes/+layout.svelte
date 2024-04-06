<script lang="ts">
	import '../global.css'

	export let data
</script>

<div class={`theme ${data.theme} ${data.color} `}>
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
