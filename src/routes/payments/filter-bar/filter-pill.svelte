<script lang="ts">
	import type { Component, Snippet } from 'svelte'
	import * as Popover from '#lib/components/ui/popover/index.js'
	import { Button } from '#lib/components/ui/button/index.js'
	import { cn } from '#lib/utils/index.js'
	import XIcon from '@lucide/svelte/icons/x'

	let {
		icon: Icon,
		label,
		active = false,
		onclear,
		contentClass,
		children
	}: {
		icon: Component<{ class?: string }>
		label: string
		active?: boolean
		onclear?: () => void
		contentClass?: string
		children: Snippet
	} = $props()
</script>

<div
	class={[
		'inline-flex items-center rounded-full bg-secondary shadow-xs',
		active ? 'text-foreground' : 'text-muted-foreground'
	]}
>
	<Popover.Root>
		<Popover.Trigger>
			{#snippet child({ props })}
				<Button
					{...props}
					variant="ghost"
					size="sm"
					class={[
						'rounded-full text-[12.5px] font-semibold hover:bg-secondary/80 hover:text-foreground dark:hover:bg-secondary/80',
						active && onclear && 'pr-1.5'
					]}
				>
					<Icon class="size-3.5" />
					{label}
				</Button>
			{/snippet}
		</Popover.Trigger>
		<Popover.Content align="end" class={cn('rounded-2xl border-none bg-card shadow-xl', contentClass)}>
			{@render children()}
		</Popover.Content>
	</Popover.Root>

	{#if active && onclear}
		<Button
			variant="ghost"
			size="icon-sm"
			onclick={onclear}
			aria-label="Clear {label}"
			class="mr-1 size-6 rounded-full text-faint hover:bg-transparent hover:text-foreground dark:hover:bg-transparent"
		>
			<XIcon class="size-3.5" />
		</Button>
	{/if}
</div>
