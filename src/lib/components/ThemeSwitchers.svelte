<script lang-ts>
	import { themeSwitcher } from '$lib/themeSwitcher/themeSwitcher'

	const theme = themeSwitcher('theme')
	const color = themeSwitcher('color', 'green')
</script>

<div>
	<button
		class="i-tabler-color-filter text-18px bg-primary"
		on:click={() => {
			const colors = ['green', 'blue', 'orange', 'pink']
			const newColorIndex = $color ? (colors.indexOf($color) + 1) % colors.length : 0
			$color = colors.at(newColorIndex)
		}}
	></button>

	<button
		class="i-tabler-moon-stars dark:i-tabler-sun text-5"
		on:click={() => {
			$theme = $theme === 'dark' ? 'light' : 'dark'
		}}
	>
	</button>
</div>
