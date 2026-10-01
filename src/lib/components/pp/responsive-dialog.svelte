<script lang="ts">
	import type { Snippet } from 'svelte'
	import { MediaQuery } from 'svelte/reactivity'
	import * as Dialog from '$lib/components/ui/dialog'
	import * as Drawer from '$lib/components/ui/drawer'
	import { cn } from '$lib/utils'
	import XIcon from '@lucide/svelte/icons/x'

	let {
		open,
		title,
		onclose,
		class: className,
		children
	}: {
		open: boolean
		title: string
		onclose: () => void
		class?: string
		children: Snippet
	} = $props()

	const isDesktop = new MediaQuery('min-width: 768px')

	function onOpenChange(isOpen: boolean) {
		if (!isOpen) onclose()
	}
</script>

{#if isDesktop.current}
	<Dialog.Root {open} {onOpenChange}>
		<Dialog.Content
			class={cn('gap-0 rounded-2xl border-none bg-card p-0 shadow-2xl', className)}
			showCloseButton={false}
		>
			<div class="flex items-center justify-between border-b border-border px-6 py-4">
				<Dialog.Title class="m-0 font-display text-[19px] font-bold tracking-[-0.025em]">{title}</Dialog.Title>
				<button
					type="button"
					onclick={onclose}
					class="flex h-8 w-8 items-center justify-center rounded-full border-none bg-muted p-0 text-muted-foreground hover:bg-muted"
					aria-label="Close"
				>
					<XIcon size={16} />
				</button>
			</div>
			{@render children()}
		</Dialog.Content>
	</Dialog.Root>
{:else}
	<Drawer.Root {open} {onOpenChange}>
		<Drawer.Content>
			<Drawer.Header>
				<Drawer.Title class="font-display text-[19px] font-bold tracking-[-0.025em]">{title}</Drawer.Title>
			</Drawer.Header>
			<div class="min-h-0 overflow-y-auto">
				{@render children()}
			</div>
		</Drawer.Content>
	</Drawer.Root>
{/if}
