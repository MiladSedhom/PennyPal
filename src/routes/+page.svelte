<script lang="ts">
	import { Button } from '$lib/components/ui/button'
	import { getLoggedInUser } from './(auth)/auth.remote'
	import { createPayments, getPayments } from './data.remote'
	import { Input } from '$lib/components/ui/input'
	import { Textarea } from '$lib/components/ui/textarea'
	import XIcon from '@lucide/svelte/icons/x'
	import DatePicker from '$lib/components/ui/date-picker/date-picker.svelte'
	import { type DateValue, getLocalTimeZone, today } from '@internationalized/date'

	const user = $derived(await getLoggedInUser())

	const paymentsFields = $state<{ amount: number; tags: number[]; note: string; date: DateValue }[]>([
		{ amount: 0, tags: [], note: '', date: today(getLocalTimeZone()) }
	])
</script>

<div class="p-4">
	<h1>Hi, {user?.username}!</h1>
	<p>Your user ID is {user?.id}.</p>

	{#each await getPayments() as payment}
		<div class="border p-2 my-2">
			<p>Payment ID: {payment.id}</p>
			<p>Amount: {payment.amount}</p>
			<p>Date: {new Date(payment.createdAt).toLocaleDateString()}</p>
		</div>
	{/each}

	{#each paymentsFields as paymentField, index}
		<form class="p-4 w-120 max-w-200 gap-2 flex">
			<Input bind:value={paymentField.amount} type="number" placeholder="amount" />
			<DatePicker bind:value={paymentField.date} />
			<Textarea bind:value={paymentField.note} placeholder="note" />
			{#if index > 0}
				<Button variant="destructive" type="button" size="icon" onclick={() => paymentsFields.splice(index, 1)}>
					<XIcon />
				</Button>
			{/if}
		</form>
	{/each}
	<Button
		variant="default"
		type="button"
		onclick={() => paymentsFields.push({ amount: 0, tags: [], note: '', date: paymentsFields.at(-1)!.date })}
	>
		Add Payment
	</Button>
	<Button
		variant="default"
		type="button"
		onclick={async () => {
			await createPayments({
				payments: paymentsFields.map((pf) => ({
					amount: pf.amount,
					note: pf.note,
					tags: [] as number[],
					date: pf.date.toDate(getLocalTimeZone())
				}))
			}).updates(getPayments())
		}}
	>
		Submit Payments
	</Button>
</div>
