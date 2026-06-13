<script lang="ts">
	import { Command } from 'bits-ui'
	import * as Popover from '$lib/components/ui/popover'
	import TagChip from './tag-chip.svelte'
	import TagIconChip from './tag-icon-chip.svelte'
	import PlusIcon from '@lucide/svelte/icons/plus'
	import CheckIcon from '@lucide/svelte/icons/check'
	import type { PopoverTriggerProps } from 'bits-ui'
	import { focusAdjacentTabbable } from '$lib/utils'
	import { quickCreateTag } from '$lib/remote/tags.remote'
	import { tick } from 'svelte'

	type Tag = { id: number; name: string; color: string; icon: string }

	let {
		tags,
		selected = $bindable([]),
		placeholder = 'Add tags',
		trigger = $bindable(null),
		triggerProps
	}: {
		tags: Tag[]
		selected?: number[]
		placeholder?: string
		trigger?: HTMLElement | null
		triggerProps?: PopoverTriggerProps
	} = $props()

	let open = $state(false)
	let search = $state('')

	const selectedTags = $derived(tags.filter((t) => selected.includes(t.id)))

	const trimmedSearch = $derived(search.trim())
	const canCreateTag = $derived(
		trimmedSearch.length > 0 && !tags.some((t) => t.name.toLowerCase() === trimmedSearch.toLowerCase())
	)

	function toggle(id: number) {
		selected = selected.includes(id) ? selected.filter((t) => t !== id) : [...selected, id]
		search = ''
	}

	async function createTag() {
		if (!canCreateTag || quickCreateTag.pending) return

		const created = await quickCreateTag(trimmedSearch)
		if (created && !selected.includes(created.id)) selected = [...selected, created.id]
		search = ''
	}

	// Tabbing out of the open palette mimics native Tab on the trigger: the palette closes and
	// focus moves to the adjacent field, as if the popover were never there.
	let tabbedOut = false

	async function paletteKeydown(e: KeyboardEvent) {
		if (e.key !== 'Tab') return
		e.preventDefault()
		tabbedOut = true
		open = false
		await tick()
		focusAdjacentTabbable(trigger, e.shiftKey ? -1 : 1)
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger
		bind:ref={trigger}
		{...triggerProps}
		class="flex w-full items-center gap-1.5 rounded-sm border border-transparent bg-transparent px-2.5 py-2 text-left text-foreground hover:bg-bg-warm"
	>
		{#if selectedTags.length > 0}
			<span class="flex flex-wrap items-center gap-1.5">
				{#each selectedTags as tg (tg.id)}
					<TagChip name={tg.name} color={tg.color} icon={tg.icon} size="sm" />
				{/each}
			</span>
		{:else}
			<span class="inline-flex items-center gap-1.5 text-[13px] text-text-mute">
				<PlusIcon size={11} />
				{placeholder}
			</span>
		{/if}
	</Popover.Trigger>

	<Popover.Content
		class="w-[280px] rounded-2xl border-none bg-card p-0 shadow-xl"
		align="start"
		onCloseAutoFocus={(e) => {
			// Keep the focus we just moved forward; only Escape/outside-click restore the trigger.
			if (tabbedOut) {
				e.preventDefault()
				tabbedOut = false
			}
		}}
	>
		<Command.Root class="flex flex-col">
			<Command.Input
				bind:value={search}
				placeholder="Search Tags..."
				onkeydown={paletteKeydown}
				class="m-2.5 rounded-sm border border-transparent bg-bg-warm px-2.5 py-1.5 text-[13px] text-foreground placeholder:text-text-mute"
			/>
			<Command.List class="max-h-[260px] overflow-y-auto px-2.5 pb-2.5">
				{#if !canCreateTag}
					<Command.Empty class="px-2.5 py-3 text-center text-[12.5px] text-text-mute">No tags match.</Command.Empty>
				{/if}
				{#each tags as tg (tg.id)}
					{@const isSelected = selected.includes(tg.id)}
					<Command.Item
						value={tg.name}
						onSelect={() => toggle(tg.id)}
						class="flex w-full cursor-pointer items-center gap-2.5 rounded-sm px-2.5 py-2 text-left text-foreground data-selected:bg-bg-warm"
					>
						<TagIconChip color={tg.color} icon={tg.icon} size={26} />
						<span class="flex-1 text-[13.5px] font-semibold">{tg.name}</span>
						{#if isSelected}
							<CheckIcon size={15} class="text-lime-text" />
						{/if}
					</Command.Item>
				{/each}
				{#if canCreateTag}
					<Command.Item
						value={search}
						forceMount
						onSelect={createTag}
						class="flex w-full cursor-pointer items-center gap-2.5 rounded-sm px-2.5 py-2 text-left text-foreground data-selected:bg-bg-warm"
					>
						<span
							class="inline-flex size-[26px] shrink-0 items-center justify-center rounded-lg bg-bg-warm text-text-mute"
						>
							<PlusIcon size={14} />
						</span>
						<span class="flex-1 text-[13.5px]">
							Create <span class="font-semibold">“{trimmedSearch}”</span>
						</span>
					</Command.Item>
				{/if}
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
