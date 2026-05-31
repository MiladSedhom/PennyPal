<script lang="ts">
	import { getTagMeta, TAG_PALETTE } from '$lib/tag-meta'

	type Props = { name: string; size?: number }
	const { name, size = 32 }: Props = $props()

	const meta = $derived(getTagMeta(name))
	const c = $derived(TAG_PALETTE[meta.color])
	const Icon = $derived(meta.icon)
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
