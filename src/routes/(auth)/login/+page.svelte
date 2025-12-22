<script lang="ts">
	import { Button } from '$lib/components/ui/button'
	import { credentialsSchema } from '$lib/schemas/credentials'
	import { login, register } from '../auth.remote'

	const error = $derived(login.fields.allIssues()?.at(0) ?? register.fields.allIssues()?.at(0))
</script>

<div class="p-4">
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
		<Button variant="default" type="submit">Login</Button>
		<Button variant="outline" {...register.buttonProps}>Register</Button>
	</form>
	{#if error}
		<p style="color: red">{error.message}</p>
	{/if}
</div>
