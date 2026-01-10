<script lang="ts">
	import { Button } from '$lib/components/ui/button'
	import { createPayments, getPayments } from '$lib/remote/payments.remote'
	import { getTags } from '$lib/remote/tags.remote'
	import { Input } from '$lib/components/ui/input'
	import { Textarea } from '$lib/components/ui/textarea'
	import XIcon from '@lucide/svelte/icons/x'
	import DatePicker from '$lib/components/ui/date-picker/date-picker.svelte'
	import { type DateValue, getLocalTimeZone, today } from '@internationalized/date'
	import * as Select from '$lib/components/ui/select/index.js'

	const paymentsForms = $state<{ amount: number; tags: number[]; note: string; date: DateValue }[]>([
		{ amount: 0, tags: [], note: '', date: today(getLocalTimeZone()) }
	])

	const tags = $derived(await getTags())
</script>

<div class="p-4 border-2 rounded-l space-y-8">
	<ul class="flex flex-col gap-6">
		{#each paymentsForms as p, index}
			<li>
				<form class="gap-2 flex flex-col md:flex-row items-start">
					<Input bind:value={p.amount} class="min-w-30 md:max-w-30" type="number" placeholder="amount" />
					<DatePicker bind:value={p.date} class="bg-amber-400 min-w-50 w-full md:max-w-50" />

					<Select.Root type="multiple" onValueChange={(values) => (p.tags = values.map((v) => parseInt(v)))}>
						<Select.Trigger class="min-w-50 w-full md:max-w-50">
							{@const tagNames = tags
								.filter((t) => p.tags.includes(t.id))
								.map((t) => t.name)
								.join(', ')}
							<span class="truncate" title={tagNames}>
								{p.tags.length === 0 ? 'Select tags...' : `${tagNames}`}
							</span>
						</Select.Trigger>
						<Select.Content>
							{#each tags as tag}
								<Select.Item value={tag.id.toString()}>{tag.name}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>

					<Textarea bind:value={p.note} class="min-h-9 py-1 md:max-w-50" placeholder="note" rows={1} />
					{#if index > 0}
						<Button variant="destructive" type="button" size="icon" onclick={() => paymentsForms.splice(index, 1)}>
							<XIcon />
						</Button>
					{/if}
				</form>
			</li>
		{/each}
	</ul>

	<div>
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
	</div>
</div>
