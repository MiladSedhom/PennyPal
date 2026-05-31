<script lang="ts">
	import type { Snippet } from 'svelte'
	import type { HTMLAttributes } from 'svelte/elements'
	import { cn } from '$lib/utils'

	type Props = {
		children: Snippet
		pad?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
		tone?: 'surface' | 'mint' | 'ink' | 'warm'
		class?: string
	} & Omit<HTMLAttributes<HTMLDivElement>, 'class'>

	const { children, pad = 'lg', tone = 'surface', class: className = '', ...rest }: Props = $props()

	const padClass = $derived(
		{
			none: 'p-0',
			sm: 'p-4',
			md: 'p-5',
			lg: 'p-6',
			xl: 'p-7'
		}[pad]
	)

	const toneClass = $derived(
		{
			surface: 'bg-card text-foreground',
			mint: 'bg-mint text-foreground',
			ink: 'bg-foreground text-background',
			warm: 'bg-bg-warm text-foreground'
		}[tone]
	)
</script>

<div class={cn('rounded-2xl', padClass, toneClass, className)} {...rest}>
	{@render children()}
</div>
