<script lang="ts">
	import { enhance } from '$app/forms'

	export let form
</script>

<h1>Login</h1>

<form action="?/login" method="post" use:enhance>
	<div>
		<label for="username">Username</label>
		<input type="text" name="username" autocomplete="off" />
	</div>
	<div>
		<label for="password">Password</label>
		<input type="password" name="password" autocomplete="off" />
	</div>

	{#if form?.invalid}
		<p class="error">Username and password is required.</p>
	{/if}

	{#if form?.credentials}
		<p class="error">You have entered the wrong credentials.</p>
	{/if}

	<button type="submit">Login</button>
</form>
