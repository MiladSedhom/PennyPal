<script lang="ts">
	import LoginForm from '$lib/components/LoginForm.svelte'

	export let form
</script>

<div class="container">
	<LoginForm {form} />
</div>

<style>
	div {
		display: grid;
		place-content: center;
		background-color: var(--color-primary);
		width: 100vw;
		height: 100vh;
	}
</style>
