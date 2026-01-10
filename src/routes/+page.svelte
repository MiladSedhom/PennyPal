<script lang="ts">
	import { Button } from '$lib/components/ui/button'
	import { getLoggedInUser } from '../lib/remote/auth.remote'
	import { getPayments } from '$lib/remote/payments.remote'
	import { Input } from '$lib/components/ui/input'

	import PaymentTable from '$lib/components/payment-table/index.svelte'
	import PaymentsForm from '$lib/components/payments-form.svelte'
	import { createTag, getTags } from '$lib/remote/tags.remote'

	const user = $derived(await getLoggedInUser())
</script>

<div class="p-4 space-y-10">
	<div>
		<h1>Hi, {user?.username}!</h1>
		<p>Your user ID is {user?.id}.</p>
	</div>

	<PaymentTable payments={await getPayments()} />

	<PaymentsForm />

	{#each await getTags() as tag}
		<div class="border p-2 my-2">
			<p>Tag ID: {tag.id}</p>
			<p>Name: {tag.name}</p>
		</div>
	{/each}

	<form {...createTag}>
		<Input {...createTag.fields.name.as('text')} />
		<Button type="submit">Create Tag</Button>
	</form>
</div>
