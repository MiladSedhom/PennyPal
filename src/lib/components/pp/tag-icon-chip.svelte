<script lang="ts">
	import { getSwatch, getIcon } from '$lib/tag-meta'

	type Props = { color: string; icon: string; size?: number }
	const { color, icon, size = 32 }: Props = $props()

	const c = $derived(getSwatch(color))
	const Icon = $derived(getIcon(icon))
	const iconSize = $derived(Math.round(size * 0.46))
	const radius = $derived(Math.round(size * 0.32))
</script>

<span
	class="inline-flex shrink-0 items-center justify-center"
	style:width="{size}px"
	style:height="{size}px"
	style:border-radius="{radius}px"
	style:background={c.bg}
	style:color={c.ink}
>
	<Icon size={iconSize} strokeWidth={1.85} />
</span>
