<script lang="ts">
	import { applyAction, enhance } from '$app/forms'

	export let form: any
</script>

<form
	action="/signup?/register"
	method="post"
	use:enhance={() => {
		return async ({ result, update }) => {
			await applyAction(result)
		}
	}}
>
	<h3>Hello there💰</h3>
	<p>Create your account</p>
	<div class="input-items">
		<div class="field">
			<input type="text" name="username" id="username" placeholder="Username" autocomplete="off" />
			{#if form?.errors?.username}
				<p class="error">{form.errors.username[0]}</p>
			{/if}
		</div>
		<div class="field">
			<input type="password" name="password" id="password" placeholder="Password" />
			{#if form?.errors?.password}
				<p class="error">{form.errors.password[0]}</p>
			{/if}
		</div>
	</div>
	<button type="submit">Sign up</button>

	<span>
		Already have an account?
		<a href="/login">Log in</a>
	</span>
</form>

<style>
	form {
		width: 350px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex-flow: column;
		background-color: var(--color-primary);

		& h3 {
			font-size: 2rem;
			color: var(--color-text-on-primary);
		}

		& p {
			font-size: 0.875rem;
			color: var(--color-text-on-primary);
		}

		& .input-items {
			width: 90%;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 0.5rem;
			margin-block: 1rem;
			& div {
				width: 100%;
			}
		}

		& input {
			background-color: color-mix(in srgb, var(--color-fields) 20%, var(--color-primary));
			padding: 1.3rem 1rem;
			border: 2px solid var(--color-text-on-primary);
			color: var(--color-text-on-primary);

			&::placeholder {
				color: color-mix(in srgb, var(--color-text-on-primary) 60%, var(--color-primary));
			}
		}

		& button {
			width: 90%;
			height: 40px;
			background-color: var(--color-primary);
			color: var(--color-text-on-primary);
			border: 2px solid var(--color-text-on-primary);
			box-shadow: 0 5px #1a010133;
			margin-bottom: 0.5rem;
		}

		& button:hover {
			filter: brightness(1.1);
		}

		& span {
			font-size: 0.75rem;
			color: color-mix(in srgb, var(--color-text-on-primary) 70%, var(--color-primary));
		}

		& a {
			color: var(--color-text-on-primary);
		}

		& .error {
			padding-left: 1rem;
			font-size: 0.75rem;
			color: tomato;
		}
	}
</style>
