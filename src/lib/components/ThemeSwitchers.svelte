<script lang="ts">
	import { browser } from '$app/environment'
	import DarkMode from '$lib/components/svgs/DarkMode.svelte'
	import LightMode from '$lib/components/svgs/LightMode.svelte'
	import Color from '$lib/components/svgs/Color.svelte'

	let isDark: boolean

	const changeTheme = () => {
		if (browser) {
			let currentTheme = document.documentElement.getAttribute('data-theme')
			let newTheme = currentTheme === 'dark' ? 'light' : 'dark'
			document.documentElement.setAttribute('data-theme', newTheme)
			isDark = currentTheme === 'dark'
			localStorage.setItem('theme-is-dark', JSON.stringify(isDark))
		}
	}
	const changeThemeColor = () => {
		if (browser) {
			const themes = ['pink', 'red', 'blue', 'green']
			let currentThemeColor = document.documentElement.getAttribute('data-theme-color') || 'green'
			let newThemeColor = themes[(themes.indexOf(currentThemeColor) + 1) % themes.length]
			document.documentElement.setAttribute('data-theme-color', newThemeColor)
			localStorage.setItem('theme-color', newThemeColor)
		}
	}
</script>

<div>
	<button class="color" on:click={changeThemeColor}>
		<Color width="18" height="18" />
	</button>
	<button on:click={changeTheme}>
		{#if !isDark}
			<LightMode width="18" height="18" />
		{:else}
			<DarkMode width="18" height="18" />
		{/if}
	</button>
</div>

<style>
	div {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	button {
		padding: 0;
		background-color: transparent;
		& path {
			fill: var(--color-text);
		}

		&:hover path {
			fill: var(--color-primary);
		}
	}

	.color {
		& path {
			fill: var(--color-primary);
		}

		&:hover path {
			filter: brightness(1.2) contrast(1.2);
		}
	}
</style>
