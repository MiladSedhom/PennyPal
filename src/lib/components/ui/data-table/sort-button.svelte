<script lang="ts">
	import type { ComponentProps } from 'svelte'
	import ArrowUpIcon from '@lucide/svelte/icons/arrow-up'
	import ArrowDownIcon from '@lucide/svelte/icons/arrow-down'
	import ArrowUpDownIcon from '@lucide/svelte/icons/arrow-up-down'

	import { Button } from '$lib/components/ui/button/index.js'

	interface Props extends ComponentProps<typeof Button> {
		isSorted: false | 'asc' | 'desc'
		text: string
	}

	let { isSorted, text, variant = 'ghost', ...restProps }: Props = $props()
</script>

<div class="grid place-items-center max-w-full">
	<Button {variant} {...restProps} class={['group transition-all duration-200', restProps.class]}>
		{text}

		<span
			class={[
				'inline-grid h-4 w-4 max-w-0 group-hover:max-w-4 *:col-start-1 *:row-start-1 overflow-hidden transition-all',
				isSorted !== false && 'max-w-4'
			]}
		>
			<ArrowUpIcon class={['h-4 w-4', isSorted === 'asc' ? 'scale-in' : 'scale-out']} />

			<ArrowDownIcon class={['h-4 w-4', isSorted === 'desc' ? 'scale-in' : 'scale-out-reverse']} />

			<ArrowUpDownIcon
				class={[
					'h-4 w-4 max-w-0 group-hover:max-w-4 overflow-hidden group-hover:scale-100 scale-75 transition-all',
					isSorted === false ? 'group-hover:scale-in' : 'scale-out'
				]}
			/>
		</span>
	</Button>
</div>
