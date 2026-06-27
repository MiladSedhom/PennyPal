<script lang="ts">
	import { Command } from 'bits-ui'
	import * as Popover from '$lib/components/ui/popover'
	import TagIconChip from './tag-icon-chip.svelte'
	import MergeIcon from '@lucide/svelte/icons/merge'

	type Tag = { id: number; name: string; color: string; icon: string }

	let {
		source,
		tags,
		onpick
	}: {
		source: Tag
		tags: Tag[]
		onpick: (targetId: number) => void
	} = $props()

	let open = $state(false)
	let search = $state('')

	// Every tag except the one being merged away — it can't fold into itself.
	const targets = $derived(tags.filter((t) => t.id !== source.id))

	function pick(id: number) {
		open = false
		search = ''
		onpick(id)
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger
		class="border-none bg-transparent p-1.5 text-text-mute hover:text-foreground"
		title="Merge into another tag"
		aria-label="Merge tag"
	>
		<MergeIcon size={16} />
	</Popover.Trigger>

	<Popover.Content class="w-[260px] rounded-2xl border-none bg-card p-0 shadow-xl" align="end">
		<Command.Root class="flex flex-col">
			<div class="px-3 pt-3 pb-1 text-[12px] text-text-mute">
				Merge <span class="font-semibold text-foreground">“{source.name}”</span> into…
			</div>
			<Command.Input
				bind:value={search}
				placeholder="Search tags…"
				class="m-2.5 rounded-sm border border-transparent bg-bg-warm px-2.5 py-1.5 text-[13px] text-foreground placeholder:text-text-mute"
			/>
			<Command.List class="max-h-[260px] overflow-y-auto px-2.5 pb-2.5">
				<Command.Empty class="px-2.5 py-3 text-center text-[12.5px] text-text-mute">No tags match.</Command.Empty>
				{#each targets as tg (tg.id)}
					<Command.Item
						value={tg.name}
						onSelect={() => pick(tg.id)}
						class="flex w-full cursor-pointer items-center gap-2.5 rounded-sm px-2.5 py-2 text-left text-foreground data-selected:bg-bg-warm"
					>
						<TagIconChip color={tg.color} icon={tg.icon} size={26} />
						<span class="flex-1 text-[13.5px] font-semibold">{tg.name}</span>
					</Command.Item>
				{/each}
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
