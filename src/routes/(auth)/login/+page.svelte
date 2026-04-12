<script lang="ts">
	import { Button } from '$lib/components/ui/button'
	import { loginOrRegister } from '$lib/remote/auth.remote'

	const error = $derived(loginOrRegister.fields.allIssues()?.at(0) ?? null)
</script>

<div class="p-4">
	<h1>Login/Register</h1>
	<form {...loginOrRegister}>
		<label>
			Username
			<input
				{...loginOrRegister.fields.username.as('text')}
				class="mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
			/>
		</label>
		<label>
			Password
			<input
				{...loginOrRegister.fields.password.as('password')}
				class="mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
			/>
		</label>
		<div class="flex gap-2">
			<Button variant="default" {...loginOrRegister.fields.action.as('submit', 'login')}>Login</Button>
			<Button variant="outline" {...loginOrRegister.fields.action.as('submit', 'register')}>Register</Button>
		</div>
	</form>
	{#if error}
		<p style="color: red">{error.message}</p>
	{/if}
</div>
