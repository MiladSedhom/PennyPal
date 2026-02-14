<script lang="ts">
	import CalendarIcon from '@lucide/svelte/icons/calendar'
	import { type DateValue, DateFormatter, getLocalTimeZone } from '@internationalized/date'
	import { cn } from '$lib/utils.js'
	import { Button, type ButtonProps } from '$lib/components/ui/button/index.js'
	import { Calendar } from '$lib/components/ui/calendar/index.js'
	import * as Popover from '$lib/components/ui/popover/index.js'
	import type { ClassValue } from 'svelte/elements'

	const df = new DateFormatter('en-US', {
		dateStyle: 'long'
	})

	interface Props extends Omit<ButtonProps, 'value'> {
		value?: DateValue
		class: ClassValue
	}

	let { value = $bindable(), class: className, ...restProps }: Props = $props()
</script>

<Popover.Root>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button
				variant="outline"
				class={cn('w-[280px] justify-start text-start font-normal ', !value && 'text-muted-foreground ', className)}
				{...restProps}
				{...props}
			>
				<CalendarIcon class="me-2 size-4" />
				{value ? df.format(value.toDate(getLocalTimeZone())) : 'Select a date'}
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-auto p-0">
		<Calendar bind:value type="single" initialFocus captionLayout="dropdown" />
	</Popover.Content>
</Popover.Root>
