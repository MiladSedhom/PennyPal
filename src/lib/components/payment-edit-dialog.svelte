<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog'
	import * as Drawer from '$lib/components/ui/drawer'
	import { Button } from '$lib/components/ui/button'
	import DatePicker from '$lib/components/ui/date-picker/date-picker.svelte'
	import TagMultiSelect from '$lib/components/pp/tag-multiselect.svelte'
	import { updatePayment } from '$lib/remote/payments.remote'
	import { CalendarDate, getLocalTimeZone } from '@internationalized/date'
	import { MediaQuery } from 'svelte/reactivity'
	import XIcon from '@lucide/svelte/icons/x'
	import CheckIcon from '@lucide/svelte/icons/check'
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle'

	type Tag = { id: number; name: string; color: string; icon: string }
	type PaymentRow = {
		id: number
		amount: number
		note: string | null
		createdAt: string | Date
		tags: Tag[]
	}

	let {
		payment,
		tags,
		onclose,
		onsaved
	}: {
		payment: PaymentRow | null
		tags: Tag[]
		onclose: () => void
		onsaved?: () => void
	} = $props()

	// Writable deriveds: editable copies that reset whenever a different payment opens.
	let amount = $derived(payment?.amount ?? 0)
	let note = $derived(payment?.note ?? '')
	let selectedTags = $derived(payment?.tags.map((t) => t.id) ?? [])
	let date = $derived.by(() => {
		const d = payment ? new Date(payment.createdAt) : new Date()
		return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate())
	})

	let saving = $state(false)

	const isDesktop = new MediaQuery('min-width: 768px')

	function onOpenChange(isOpen: boolean) {
		if (!isOpen) onclose()
	}

	async function save() {
		if (!payment || !(amount > 0)) return
		saving = true
		try {
			// Keep the original time of day so intra-day ordering survives edits that don't touch the date.
			const orig = new Date(payment.createdAt)
			const next = date.toDate(getLocalTimeZone())
			next.setHours(orig.getHours(), orig.getMinutes(), orig.getSeconds(), orig.getMilliseconds())
			await updatePayment({ id: payment.id, amount, note, tags: selectedTags, date: next })
			onsaved?.()
			onclose()
		} finally {
			saving = false
		}
	}
</script>

{#snippet editForm()}
	<form
		class="flex flex-col gap-4 px-4 pb-4 md:px-6 md:py-5"
		onsubmit={(e) => {
			e.preventDefault()
			save()
		}}
	>
		<div class="grid grid-cols-2 gap-3">
			<div class="flex flex-col gap-1.5">
				<span class="caption">Date</span>
				<DatePicker
					bind:value={date}
					class="w-full rounded-[10px]! border-transparent bg-muted! px-3!"
					title={date.toString()}
				/>
			</div>
			<div class="flex flex-col gap-1.5">
				<span class="caption">Amount</span>
				<input
					type="number"
					bind:value={amount}
					placeholder="0"
					step="1"
					min="0"
					class="w-full rounded-[10px] border border-transparent bg-muted px-3 py-2 text-right font-mono text-[13.5px] font-medium text-foreground"
				/>
			</div>
		</div>

		<div class="flex flex-col gap-1.5">
			<span class="caption">Tags</span>
			<div class="rounded-[10px] bg-muted">
				<TagMultiSelect {tags} bind:selected={selectedTags} />
			</div>
		</div>

		<div class="flex flex-col gap-1.5">
			<span class="caption">Note</span>
			<input
				bind:value={note}
				placeholder="—"
				class="w-full rounded-[10px] border border-transparent bg-muted px-3 py-2 text-[13.5px] text-foreground"
			/>
		</div>

		<div class="mt-1 flex gap-2 md:justify-end">
			<button
				type="button"
				onclick={onclose}
				class="flex-1 border-none bg-transparent px-3 py-2 text-[13.5px] font-semibold text-muted-foreground hover:text-foreground md:flex-none"
			>
				Cancel
			</button>
			<Button
				type="submit"
				class="h-[36px] flex-1 gap-2 rounded-full bg-muted px-[18px] text-[13.5px] font-semibold text-foreground hover:bg-foreground/10 md:flex-none"
				disabled={saving || !(amount > 0)}
			>
				{#if saving}
					<LoaderCircleIcon size={15} class="animate-spin" />
				{:else}
					<CheckIcon size={15} />
				{/if}
				Save changes
			</Button>
		</div>
	</form>
{/snippet}

{#if isDesktop.current}
	<Dialog.Root open={payment !== null} {onOpenChange}>
		<Dialog.Content class="max-w-[440px] gap-0 rounded-2xl border-none bg-card p-0 shadow-2xl" showCloseButton={false}>
			<div class="flex items-center justify-between border-b border-border px-6 py-4">
				<Dialog.Title class="m-0 font-display text-[19px] font-bold tracking-[-0.025em]">Edit payment</Dialog.Title>
				<button
					type="button"
					onclick={onclose}
					class="flex h-8 w-8 items-center justify-center rounded-full border-none bg-muted p-0 text-muted-foreground hover:bg-muted"
					aria-label="Close"
				>
					<XIcon size={16} />
				</button>
			</div>
			{@render editForm()}
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<Drawer.Root open={payment !== null} {onOpenChange}>
		<Drawer.Content>
			<Drawer.Header>
				<Drawer.Title class="font-display text-[19px] font-bold tracking-[-0.025em]">Edit payment</Drawer.Title>
			</Drawer.Header>
			{@render editForm()}
		</Drawer.Content>
	</Drawer.Root>
{/if}
