<script lang="ts">
	import tinycolor from 'tinycolor2'
	import { onMount } from 'svelte'

	let cellRef: any
	let textColor: any

	onMount(async () => {
		const styles = getComputedStyle(cellRef)
		const srgbColor = formatSrgbColor(styles.backgroundColor)
		const color = tinycolor(srgbToRgb(srgbColor))
		textColor = color.getLuminance() > 0.3 ? '#000' : '#fff'
	})

	function formatSrgbColor(srgbColor: string): string {
		// Use a regular expression to extract the numeric values
		const match = srgbColor.match(/srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/)

		if (match) {
			const r = parseFloat(match[1])
			const g = parseFloat(match[2])
			const b = parseFloat(match[3])

			// Use template literals to format the result
			return `srgb(${r}, ${g}, ${b})`
		}

		// Return the input as is if it doesn't match the expected format
		return srgbColor
	}

	function srgbToRgb(srgbColor: string): string {
		const match = srgbColor.match(/srgb\(([^,]+),\s([^,]+),\s([^)]+)\)/)

		if (match) {
			const r = parseFloat(match[1]) * 255
			const g = parseFloat(match[2]) * 255
			const b = parseFloat(match[3]) * 255

			return `rgb(${r}, ${g}, ${b}`
		}

		// Return the input as is if it doesn't match the expected format
		return srgbColor
	}
</script>

<td bind:this={cellRef} style="color: {textColor};">
	<slot />
</td>

<style>
	td {
		width: 5rem;
		padding: 0.4rem 1rem;
		white-space: nowrap;
		/* border: solid 1px var(--color-text-60); */
		text-align: center;
		border: 1px solid var(--color-background-1);

		background-color: color-mix(in srgb, var(--color-background), var(--color-primary) var(--_color-percentage, 0));
		color: color-mix(in srgb, var(--color-text-alt) 90%, var(--color-text-on-primary));
	}
</style>
