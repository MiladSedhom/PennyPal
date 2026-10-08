<script lang="ts">
	import * as ToggleGroup from '#lib/components/ui/toggle-group/index.js'
	import { getIcon, getSwatch } from '#lib/tag-meta.js'
	import type { Tag } from '../payments-format'

	let { tag }: { tag: Tag } = $props()

	const swatch = $derived(getSwatch(tag.color))
	const Icon = $derived(getIcon(tag.icon))
</script>

<ToggleGroup.Item
	value={String(tag.id)}
	style="--tag-bg: {swatch.bg}; --tag-ink: {swatch.ink}"
	class="border bg-background hover:bg-accent dark:border-input dark:bg-input/30 dark:hover:bg-input/50 data-[state=on]:border-transparent data-[state=on]:bg-(--tag-bg) data-[state=on]:text-(--tag-ink) data-[state=on]:hover:bg-(--tag-bg)"
>
	<Icon class="size-3" />
	{tag.name}
</ToggleGroup.Item>
