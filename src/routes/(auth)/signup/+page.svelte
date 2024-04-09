<script lang="ts">
	import SignupForm from '$lib/components/SignupForm.svelte'

	export let form
</script>

<div>
	<SignupForm {form} />
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
