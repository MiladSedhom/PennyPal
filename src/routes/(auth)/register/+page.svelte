<script lang="ts">
	import { enhance } from '$app/forms'

	export let form
</script>

<h1>Register</h1>

<form action="?/register" method="post" use:enhance>
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

	{#if form?.usernameTaken}
		<p class="error">Username is taken.</p>
	{/if}

	<button type="submit">Register</button>
</form>
