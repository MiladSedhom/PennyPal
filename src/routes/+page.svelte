<script lang="ts">
	export let data
</script>

<header>
	<span class="logo"><span class="primary">Penny</span>Pal</span>

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
</header>

{#if data.user}
	<h1>Hello {data.user.username}</h1>
{/if}
<h1>very cool landing page</h1>

<p>go to <a href="/app">app</a></p>

<style>
	header {
		height: 4rem;
		background-color: var(--color-dark);
		padding: 0 5rem;
		display: flex;
		justify-content: space-between;
		align-items: center;

		& .logo {
			display: inline-block;
			font-size: 1.5rem;
			font-family: var(--serif);
			font-weight: bold;

			& .primary {
				color: var(--color-primary);
			}
		}

		& nav {
			padding: 1rem;
			display: flex;
			align-items: center;
			gap: 1rem;

			& a {
				text-decoration: none;
				&:hover {
					color: var(--color-primary);
				}
			}

			& button {
				background-color: var(--color-primary);
				padding: 0.3em 0.5em;
			}
		}
	}
</style>
