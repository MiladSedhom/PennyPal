<script lang="ts" module>
	import { formatMoney } from '#lib/utils/index.js'

	export function amountRangeLabel({ min, max }: { min: number | null; max: number | null }): string {
		if (min != null && max != null) return `${formatMoney(min)}–${formatMoney(max)}`
		if (min != null) return `≥ ${formatMoney(min)}`
		if (max != null) return `≤ ${formatMoney(max)}`
		return 'Amount'
	}
</script>

<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js'
	import { Slider } from '#lib/components/ui/slider/index.js'
	import * as ToggleGroup from '#lib/components/ui/toggle-group/index.js'
	import type { PaymentFilters } from '../filters.svelte'

	let { filters, largestPayment }: { filters: PaymentFilters; largestPayment: number } = $props()

	const ceiling = $derived(Math.max(largestPayment, 500))

	const presets = [
		{ label: '< $25', min: null, max: 25 },
		{ label: '$25–100', min: 25, max: 100 },
		{ label: '$100–500', min: 100, max: 500 },
		{ label: '$500+', min: 500, max: null }
	]
	const activePreset = $derived(
		presets.find((p) => p.min === filters.amountRange.min && p.max === filters.amountRange.max)?.label ?? ''
	)

	function pickPreset(label: string) {
		const preset = presets.find((p) => p.label === label)
		if (preset) filters.setAmount(preset.min, preset.max)
	}

	const sliderValue = $derived<[number, number]>([filters.amountRange.min ?? 0, filters.amountRange.max ?? ceiling])

	// The slider's ends mean "no bound", so they're stored as null rather than 0 or the ceiling.
	function onSliderChange([min, max]: number[]) {
		filters.setAmount(min <= 0 ? null : min, max >= ceiling ? null : max)
	}

	function parseAmount(text: string): number | null {
		const value = text.trim()
		return value === '' ? null : Math.max(0, Math.round(Number(value)))
	}
</script>

<span class="caption mb-2.5 block">Quick ranges</span>
<ToggleGroup.Root
	type="single"
	aria-label="Quick amount ranges"
	class="mb-4"
	bind:value={() => activePreset, pickPreset}
>
	{#each presets as preset (preset.label)}
		<ToggleGroup.Item value={preset.label}>{preset.label}</ToggleGroup.Item>
	{/each}
</ToggleGroup.Root>

<span class="caption mb-3 block">Custom</span>
<Slider
	type="multiple"
	value={sliderValue}
	onValueChange={onSliderChange}
	min={0}
	max={ceiling}
	step={1}
	thumbLabels={['Minimum amount', 'Maximum amount']}
/>
<div class="mt-4 flex items-center gap-2">
	<div class="relative flex flex-1 items-center">
		<span class="absolute left-[12px] font-mono text-[13px] text-faint">$</span>
		<input
			inputmode="numeric"
			aria-label="Minimum amount"
			placeholder="Min"
			value={filters.amountMin ?? ''}
			oninput={(e) => (filters.amountMin = parseAmount(e.currentTarget.value))}
			class="w-full rounded-sm border border-border bg-muted py-[8px] pl-[24px] pr-[10px] font-mono text-[13px] font-medium text-foreground outline-none focus:border-ring"
		/>
	</div>
	<span class="text-faint">–</span>
	<div class="relative flex flex-1 items-center">
		<span class="absolute left-[12px] font-mono text-[13px] text-faint">$</span>
		<input
			inputmode="numeric"
			aria-label="Maximum amount"
			placeholder="Max"
			value={filters.amountMax ?? ''}
			oninput={(e) => (filters.amountMax = parseAmount(e.currentTarget.value))}
			class="w-full rounded-sm border border-border bg-muted py-[8px] pl-[24px] pr-[10px] font-mono text-[13px] font-medium text-foreground outline-none focus:border-ring"
		/>
	</div>
</div>
{#if filters.isAmountActive}
	<Button
		variant="link"
		size="sm"
		onclick={filters.clearAmount}
		class="mt-3 w-full text-[12.5px] font-semibold text-kit-navy"
	>
		Clear
	</Button>
{/if}
