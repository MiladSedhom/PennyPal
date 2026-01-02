<script lang="ts">
	import { Button } from '$lib/components/ui/button'
	import { getLoggedInUser } from './(auth)/auth.remote'
	import { createPayments, createTag, getPayments, getTags } from './data.remote'
	import { Input } from '$lib/components/ui/input'
	import { Textarea } from '$lib/components/ui/textarea'
	import XIcon from '@lucide/svelte/icons/x'
	import DatePicker from '$lib/components/ui/date-picker/date-picker.svelte'
	import { type DateValue, getLocalTimeZone, today } from '@internationalized/date'
	import { formatRelativeTime } from '$lib/utils'
	import PaymentTable from '$lib/components/payment-table.svelte'
	import * as Select from '$lib/components/ui/select/index.js'

	const user = $derived(await getLoggedInUser())

	const formatter = new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		weekday: 'long'
	})

	const paymentsForms = $state<{ amount: number; tags: number[]; note: string; date: DateValue }[]>([
		{ amount: 0, tags: [], note: '', date: today(getLocalTimeZone()) }
	])
</script>

<div class="p-4">
	<h1>Hi, {user?.username}!</h1>
	<p>Your user ID is {user?.id}.</p>

	<!-- <PaymentTable payments={await getPayments()} /> -->

	{#each await getPayments() as payment}
		<div class="border p-2 my-2">
			<p>Payment ID: {payment.id}</p>
			<p>Amount: {payment.amount}</p>
			<p>Date: {new Date(payment.createdAt).toLocaleDateString()}</p>
			<p>Note: {payment.note}</p>
			<p>Tags:</p>
			<ul>
				{#each payment.tags as tag}
					<li>{tag.name}</li>
				{/each}
			</ul>
		</div>
	{/each}

	{#each paymentsForms as p, index}
		<form class="p-4 w-120 max-w-200 gap-2 flex">
			<Input bind:value={p.amount} type="number" placeholder="amount" />
			<DatePicker bind:value={p.date} />

			<Select.Root type="multiple" onValueChange={(values) => (p.tags = values.map((v) => parseInt(v)))}>
				<Select.Trigger class="w-[180px]"></Select.Trigger>
				<Select.Content>
					{#each await getTags() as tag}
						<Select.Item value={tag.id.toString()}>{tag.name}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
			<Textarea bind:value={p.note} placeholder="note" />
			{#if index > 0}
				<Button variant="destructive" type="button" size="icon" onclick={() => paymentsForms.splice(index, 1)}>
					<XIcon />
				</Button>
			{/if}
		</form>
	{/each}

	<Button
		variant="default"
		type="button"
		onclick={() => paymentsForms.push({ amount: 0, tags: [], note: '', date: paymentsForms.at(-1)!.date })}
	>
		Add Payment
	</Button>
	<Button
		variant="default"
		type="button"
		onclick={async () => {
			await createPayments({
				payments: paymentsForms.map((pf) => ({
					amount: pf.amount,
					note: pf.note,
					tags: pf.tags,
					date: pf.date.toDate(getLocalTimeZone())
				}))
			}).updates(getPayments())
		}}
	>
		Submit Payments
	</Button>

	{#each await getTags() as tag}
		<div class="border p-2 my-2">
			<p>Tag ID: {tag.id}</p>
			<p>Name: {tag.name}</p>
		</div>
	{/each}

	<form
		{...createTag.enhance(async ({ form, data, submit }) => {
			try {
				await submit()
				form.reset()
				getTags().refresh()
			} catch (error) {
				console.log('Error creating tag:', error)
			}
		})}
	>
		<Input {...createTag.fields.name.as('text')} />
		<Button type="submit">Create Tag</Button>
	</form>
</div>
