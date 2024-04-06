<script lang="ts">
	import { page } from '$app/stores'
	import Header from '$lib/components/Header.svelte'
</script>

<Header />
<section>
	<h1>{$page.status}</h1>
	<p>
		You got me, I'm too lazy to make a proper 404 page, just head <a href="/">home</a> please, or maybe back to
		<a href="/app">app</a>.
	</p>
	<span>and get a life</span>
</section>

<style>
	section {
		height: calc(100vh - 4rem);
		padding: 2rem;
		background-color: var(--color-background);
	}

	h1 {
		font-size: 6rem;
		color: var(--color-primary);
	}

	a {
		color: var(--color-primary);
	}

	span {
		font-size: 10px;
		opacity: 0.5;
	}
</style>
