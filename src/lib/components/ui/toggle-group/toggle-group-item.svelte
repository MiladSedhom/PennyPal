<script lang="ts">
	import { ToggleGroup as ToggleGroupPrimitive } from 'bits-ui'
	import { cn } from '#lib/utils/index.js'

	let { ref = $bindable(null), class: className, ...restProps }: ToggleGroupPrimitive.ItemProps = $props()
</script>

<ToggleGroupPrimitive.Item
	bind:ref
	data-slot="toggle-group-item"
	class={cn(
		"inline-flex h-7 shrink-0 items-center justify-center gap-1.5 rounded-full bg-secondary px-3 text-[12.5px] font-semibold whitespace-nowrap text-muted-foreground shadow-xs transition-all hover:bg-secondary/80 hover:text-foreground disabled:pointer-events-none disabled:opacity-50 has-[>svg]:px-2.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary/90 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3",
		className
	)}
	{...restProps}
/>
