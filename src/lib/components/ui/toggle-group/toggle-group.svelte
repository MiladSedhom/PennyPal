<script lang="ts">
	import { ToggleGroup as ToggleGroupPrimitive } from 'bits-ui'
	import { cn } from '#lib/utils/index.js'

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		...restProps
	}: ToggleGroupPrimitive.RootProps = $props()
</script>

<!-- Same discriminated-union workaround as the slider: `value` is a string or string[] depending on `type`. -->
<ToggleGroupPrimitive.Root
	bind:ref
	bind:value={value as never}
	data-slot="toggle-group"
	class={cn('flex flex-wrap gap-2', className)}
	{...restProps}
/>
