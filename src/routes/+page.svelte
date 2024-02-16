<script lang="ts">
	import { page } from '$app/stores'

	export let data
</script>

{#if data.user}
	<h1>Hello {$page.data.user.username}</h1>
{/if}
<h1>very cool landing page</h1>

<p>go to <a href="/app">app</a></p>
