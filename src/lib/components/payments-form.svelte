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
	import * as Dialog from '$lib/components/ui/dialog'

	let open = $state(false)

	type paymentForm = { amount: number; tags: number[]; note: string; date: DateValue }

	const paymentsForms = $state<paymentForm[]>([{ amount: 0, tags: [], note: '', date: today(getLocalTimeZone()) }])

	const tags = $derived(await getTags())
</script>

<svelte:window
	on:keydown={(e) => {
		if (e.key === 'n' && e.altKey) {
			open = !open
			e.preventDefault()
		}
	}}
/>

<Dialog.Root bind:open>
	<Dialog.Content class=" min-h-[45%] h-[50%] flex flex-col justify-between gap-8">
		<Dialog.Header class="w-full max-h-12 sticky top-0">
			<Dialog.Title class="text-lg font-semibold text-start w-full">Add Payments</Dialog.Title>
		</Dialog.Header>

		<div class="flex flex-col gap-8 items-center justify-start *:max-w-120 grow overflow-y-auto no-scrollbar p-2">
			<ul class="flex flex-col gap-6">
				{#each paymentsForms as p, index}
					<li>
						<form
							class="[--cols:1] has-[#d-btn]:[--cols:2] sm:[--cols:2] sm:has-[#d-btn]:[--cols:3] md:[--cols:3] md:has-[#d-btn]:[--cols:4] grid grid-cols-1 sm:grid-cols-[6rem_1fr] md:grid-cols-[6rem_1fr_1fr] gap-2"
						>
							<Input bind:value={p.amount} class="max-w-full" type="number" placeholder="amount" />

							<DatePicker
								bind:value={p.date}
								class="bg-amber-400 w-full col-span-(--cols) sm:col-span-1"
								title={p.date.toString()}
							/>

							<Select.Root type="multiple" onValueChange={(values) => (p.tags = values.map((v) => parseInt(v)))}>
								<Select.Trigger class="w-full col-span-(--cols) md:col-span-1 md:max-w-42">
									{@const tagNames = tags.filter((t) => p.tags.includes(t.id)).map((t) => t.name)}
									{@const tagNamesStr =
										tagNames.length < 4
											? tagNames.join(', ')
											: `${tagNames.at(1)}, ${tagNames.at(2)}, (+${tagNames.length - 3}), ${tagNames.at(-1)}`}
									<span class="truncate" title={tagNames.join(', ')}>
										{p.tags.length === 0 ? 'Select tags...' : `${tagNamesStr}`}
									</span>
								</Select.Trigger>
								<Select.Content>
									{#each tags as tag}
										<Select.Item value={tag.id.toString()}>{tag.name}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>

							<Textarea bind:value={p.note} class="min-h-9 py-1 col-span-(--cols)" placeholder="Note..." rows={1} />

							{#if index > 0}
								<Button
									id="d-btn"
									class="row-1 col-(--cols)"
									variant="destructive"
									type="button"
									size="icon"
									onclick={() => paymentsForms.splice(index, 1)}
								>
									<XIcon />
								</Button>
							{/if}
						</form>
					</li>
				{/each}
			</ul>
		</div>
		<Dialog.Footer class="flex *:grow w-full max-w-full gap-4">
			<Button
				variant="outline"
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
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
