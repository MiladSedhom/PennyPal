<script lang="ts">
	import { page } from '$app/stores'
	import '../global.css'

	export let data
</script>

<nav>
	{#if !data.user}
		<a href="/login">Login</a>
		<a href="/register">Register</a>
	{/if}

	{#if data.user}
		<a href="/admin">Admin</a>

		<form action="/logout" method="POST">
			<button type="submit">Log out</button>
		</form>
	{/if}
</nav>

<main>
	<slot />
</main>

<pre>
	{JSON.stringify($page, null, 2)}
</pre>

<style>
	nav {
		display: flex;
		gap: 1rem;
	}

	:global(.error) {
		color: tomato;
	}
	:global(a) {
		color: white;
	}
</style>
