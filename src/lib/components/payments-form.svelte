<script lang="ts">
	import { Button } from '$lib/components/ui/button'
	import { createPayments, getPayments } from '$lib/remote/payments.remote'
	import { getTags } from '$lib/remote/tags.remote'
	import XIcon from '@lucide/svelte/icons/x'
	import PlusIcon from '@lucide/svelte/icons/plus'
	import CheckIcon from '@lucide/svelte/icons/check'
	import SearchIcon from '@lucide/svelte/icons/search'
	import MoreHorizontalIcon from '@lucide/svelte/icons/more-horizontal'
	import DatePicker from '$lib/components/ui/date-picker/date-picker.svelte'
	import { type DateValue, getLocalTimeZone, today } from '@internationalized/date'
	import * as Popover from '$lib/components/ui/popover'
	import * as Dialog from '$lib/components/ui/dialog'
	import Caption from '$lib/components/pp/caption.svelte'
	import Kbd from '$lib/components/pp/kbd.svelte'
	import TagChip from '$lib/components/pp/tag-chip.svelte'
	import TagIconChip from '$lib/components/pp/tag-icon-chip.svelte'

	let open = $state(false)
	let pickerSearch = $state('')

	type PaymentRow = { amount: number; tags: number[]; note: string; date: DateValue }

	const blank = (): PaymentRow => ({
		amount: 0,
		tags: [],
		note: '',
		date: today(getLocalTimeZone())
	})
	const paymentsForms = $state<PaymentRow[]>([blank()])

	const tags = $derived(await getTags())

	const isComplete = (r: PaymentRow) => r.amount > 0 && r.date
	const completeRows = $derived(paymentsForms.filter(isComplete))
	const completeTotal = $derived(completeRows.reduce((a, r) => a + r.amount, 0))

	function toggleTag(row: PaymentRow, id: number) {
		row.tags = row.tags.includes(id) ? row.tags.filter((t) => t !== id) : [...row.tags, id]
	}

	function filteredTags() {
		const s = pickerSearch.trim().toLowerCase()
		if (!s) return tags
		return tags.filter((t) => t.name.toLowerCase().includes(s))
	}

	const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
</script>

<svelte:window
	on:keydown={(e) => {
		if (e.key === 'n' && e.altKey) {
			open = !open
			e.preventDefault()
		}
	}}
/>

<Button
	type="button"
	onclick={() => (open = true)}
	class="h-[40px] gap-2 rounded-full bg-foreground px-[18px] text-[13.5px] font-semibold text-background hover:bg-foreground/90"
>
	<PlusIcon size={15} /> Add payments
</Button>

<Dialog.Root bind:open>
	<Dialog.Content
		class="!max-w-[1100px] sm:!max-w-[1100px] gap-0 rounded-2xl border-none bg-card p-0 shadow-2xl"
		showCloseButton={false}
	>
		<div class="flex items-center justify-between border-b border-border-soft px-7 py-5">
			<div class="flex items-baseline gap-3">
				<Dialog.Title class="m-0 font-display text-[22px] font-bold tracking-[-0.025em]">Add payments</Dialog.Title>
				<Caption>Enter several at once</Caption>
			</div>
			<div class="flex items-center gap-3">
				<span class="hidden items-center gap-1.5 text-[12px] text-text-mute sm:inline-flex">
					<Kbd>Tab</Kbd> next
					<span class="ml-2"></span><Kbd>↵</Kbd> add row
				</span>
				<button
					type="button"
					onclick={() => (open = false)}
					class="flex h-8 w-8 items-center justify-center rounded-full border-none bg-bg-warm p-0 text-text-dim hover:bg-mint"
					aria-label="Close"
				>
					<XIcon size={16} />
				</button>
			</div>
		</div>

		<div
			class="grid items-center gap-3 border-b border-border-soft bg-bg-warm px-7 py-3"
			style:grid-template-columns="32px 150px 130px 1.4fr 1fr 32px"
		>
			<span></span>
			<Caption>Date</Caption>
			<Caption class="text-right">Amount</Caption>
			<Caption>Tags</Caption>
			<Caption>Note</Caption>
			<span></span>
		</div>

		<div class="max-h-[55vh] overflow-y-auto">
			{#each paymentsForms as p, idx (idx)}
				{@const complete = isComplete(p)}
				<form
					class="grid items-center gap-3 border-b border-border-soft px-7 py-2"
					style:grid-template-columns="32px 150px 130px 1.4fr 1fr 32px"
				>
					<span class="text-center font-mono text-[11px] tracking-[0.04em] text-text-mute">
						{String(idx + 1).padStart(2, '0')}
					</span>

					<DatePicker
						bind:value={p.date}
						class="w-full !border-transparent !bg-transparent !rounded-[10px] !px-2.5 hover:!bg-bg-warm focus:!border-primary"
						title={p.date.toString()}
					/>

					<input
						type="number"
						bind:value={p.amount}
						placeholder="0.00"
						step="0.01"
						class="w-full rounded-[10px] border border-transparent bg-transparent px-2.5 py-2 text-right font-mono text-[13.5px] font-medium text-foreground outline-none hover:bg-bg-warm focus:border-primary"
					/>

					<Popover.Root>
						<Popover.Trigger>
							{#snippet child({ props })}
								<button
									{...props}
									type="button"
									class="flex w-full items-center gap-1.5 rounded-[10px] border border-transparent bg-transparent px-2.5 py-2 text-left text-foreground hover:bg-bg-warm focus:border-primary"
								>
									{#if p.tags.length > 0}
										<span class="flex flex-wrap items-center gap-1.5">
											{#each tags.filter((t) => p.tags.includes(t.id)) as tg (tg.id)}
												<TagChip name={tg.name} size="sm" />
											{/each}
										</span>
									{:else}
										<span class="inline-flex items-center gap-1.5 text-[13px] text-text-mute">
											<PlusIcon size={11} /> Add tags
										</span>
									{/if}
								</button>
							{/snippet}
						</Popover.Trigger>
						<Popover.Content class="w-[300px] rounded-2xl border-none bg-card p-2.5 shadow-xl" align="start">
							<div class="mb-2 flex items-center gap-2 rounded-[10px] bg-bg-warm px-2.5 py-1.5">
								<SearchIcon size={13} class="text-text-mute" />
								<input
									bind:value={pickerSearch}
									placeholder="Search tags…"
									class="flex-1 border-none bg-transparent text-[13px] text-foreground outline-none placeholder:text-text-mute"
								/>
							</div>
							<div class="flex max-h-[260px] flex-col gap-0.5 overflow-y-auto">
								{#each filteredTags() as tg (tg.id)}
									{@const sel = p.tags.includes(tg.id)}
									<button
										type="button"
										onclick={() => toggleTag(p, tg.id)}
										class="flex w-full items-center gap-2.5 rounded-[10px] border-none px-2.5 py-2 text-left text-foreground"
										class:bg-bg-warm={sel}
										class:bg-transparent={!sel}
									>
										<TagIconChip name={tg.name} size={26} />
										<span class="flex-1 text-[13.5px] font-semibold">{tg.name}</span>
										{#if sel}
											<CheckIcon size={15} class="text-lime-text" />
										{/if}
									</button>
								{:else}
									<div class="px-2.5 py-3 text-center text-[12.5px] text-text-mute">No tags match.</div>
								{/each}
							</div>
							<div class="mt-2 border-t border-border-soft pt-2">
								<button
									type="button"
									class="flex w-full items-center gap-2 rounded-[10px] border-none bg-transparent px-2.5 py-[7px] text-[13px] font-semibold text-lime-text"
								>
									<PlusIcon size={13} /> Create new tag
								</button>
							</div>
						</Popover.Content>
					</Popover.Root>

					<input
						bind:value={p.note}
						placeholder="—"
						class="w-full rounded-[10px] border border-transparent bg-transparent px-2.5 py-2 text-[13.5px] text-foreground outline-none hover:bg-bg-warm focus:border-primary"
					/>

					<span class="flex items-center justify-center" class:text-lime-text={complete}>
						{#if complete}
							<CheckIcon size={16} />
						{:else if paymentsForms.length > 1}
							<button
								type="button"
								onclick={() => paymentsForms.splice(idx, 1)}
								class="flex border-none bg-transparent p-1 text-text-mute"
								aria-label="Remove row"
							>
								<XIcon size={13} />
							</button>
						{:else}
							<span class="text-text-mute"><MoreHorizontalIcon size={14} /></span>
						{/if}
					</span>
				</form>
			{/each}

			<button
				type="button"
				onclick={() =>
					paymentsForms.push({
						amount: 0,
						tags: [],
						note: '',
						date: paymentsForms.at(-1)!.date
					})}
				class="flex w-full items-center gap-2 border-none bg-transparent px-7 py-4 text-left text-[13.5px] font-semibold text-text-dim hover:text-foreground"
			>
				<span class="inline-flex h-[22px] w-[22px] items-center justify-center rounded-[7px] bg-mint text-foreground">
					<PlusIcon size={13} />
				</span>
				Add another payment
			</button>
		</div>

		<!-- Sticky commit bar -->
		<div class="flex justify-center px-7 pb-5 pt-2">
			<div
				class="flex w-full max-w-[1000px] items-center gap-5 rounded-full bg-foreground px-6 py-3 text-background shadow-xl"
			>
				<div class="flex items-baseline gap-2">
					<span class="font-display text-[22px] font-bold tracking-[-0.02em] text-background">
						{fmt.format(completeTotal)}
					</span>
					<span class="text-[13px] text-background/60">
						{completeRows.length} payment{completeRows.length === 1 ? '' : 's'} ready
					</span>
				</div>
				<div class="flex-1"></div>
				<button
					type="button"
					onclick={() => (open = false)}
					class="border-none bg-transparent px-2 py-2.5 text-[13.5px] font-semibold text-background/70 hover:text-background"
				>
					Cancel
				</button>
				<Button
					type="button"
					class="h-[36px] gap-2 rounded-full bg-mint px-[18px] text-[13.5px] font-semibold text-foreground hover:bg-mint-deep"
					disabled={completeRows.length === 0}
					onclick={async () => {
						await createPayments({
							payments: completeRows.map((pf) => ({
								amount: pf.amount,
								note: pf.note,
								tags: pf.tags,
								date: pf.date.toDate(getLocalTimeZone())
							}))
						}).updates(getPayments())
						paymentsForms.splice(0, paymentsForms.length, blank())
						open = false
					}}
				>
					<CheckIcon size={15} />
					Save {completeRows.length} payment{completeRows.length === 1 ? '' : 's'}
				</Button>
			</div>
		</div>
	</Dialog.Content>
</Dialog.Root>
