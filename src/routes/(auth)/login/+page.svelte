<script lang="ts">
	import { credentialsSchema } from '$lib/schemas/credentials'
	import { getLoggedInUser, login, register } from '../auth.remote'
	import { goto } from '$app/navigation'

	const error = $derived(login.fields.allIssues()?.at(0) ?? register.fields.allIssues()?.at(0))
</script>

<h1>Login/Register</h1>
<form {...login.preflight(credentialsSchema)}>
	<label>
		Username
		<input
			{...login.fields.username.as('text')}
			class="mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
		/>
	</label>
	<label>
		Password
		<input
			{...login.fields.password.as('password')}
			class="mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
		/>
	</label>
	<button class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">Login</button>
	<button {...register.buttonProps} class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
		>Register</button
	>
</form>
{#if error}
	<p style="color: red">{error.message}</p>
{/if}
