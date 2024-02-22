<script lang="ts">
	import { page } from '$app/stores'

	export let data
</script>

<nav>
	<a href="/app">App</a>
	{#if !data.user}
		<a href="/login">Login</a>
		<a href="/register">Register</a>
	{/if}

	{#if data.user}
		<form action="/logout" method="POST">
			<button type="submit">Log out</button>
		</form>
	{/if}
</nav>

{#if data.user}
	<h1>Hello {$page.data.user.username}</h1>
{/if}
<h1>very cool landing page</h1>

<p>go to <a href="/app">app</a></p>

<style>
	nav {
		padding: 1rem;
		display: flex;
		gap: 1rem;
	}
</style>
