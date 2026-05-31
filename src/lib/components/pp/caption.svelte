<script lang="ts">
	import type { Snippet } from 'svelte'
	import type { HTMLAttributes } from 'svelte/elements'

	type Props = {
		children: Snippet
		class?: string
	} & Omit<HTMLAttributes<HTMLSpanElement>, 'class'>

	const { children, class: className = '', ...rest }: Props = $props()
</script>

<span class="caption {className}" {...rest}>
	{@render children()}
</span>
