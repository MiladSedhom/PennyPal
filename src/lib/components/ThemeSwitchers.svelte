<script lang="ts">
	import DarkMode from '$lib/components/svgs/DarkMode.svelte'
	import LightMode from '$lib/components/svgs/LightMode.svelte'
	import Color from '$lib/components/svgs/Color.svelte'
	import { enhance } from '$app/forms'
	import { page } from '$app/stores'
	import type { SubmitFunction } from '@sveltejs/kit'
	import { colors } from '$lib/theme'

	const submitter: SubmitFunction = ({ action }) => {
		const themeProvider = document.querySelector('.theme')
		if (action.search === '?/changeColor') {
			const currentColor = themeProvider?.classList[2]
			if (currentColor) {
				let nextColor = colors[(colors.indexOf(currentColor) + 1) % colors.length]
				themeProvider?.classList.replace(currentColor, nextColor)
			}
		}
		if (action.search === '?/changeTheme') {
			const currentTheme = themeProvider?.classList[1]
			if (currentTheme) themeProvider?.classList.replace(currentTheme, currentTheme === 'dark' ? 'light' : 'dark')
			$page.data.theme = currentTheme
		}
	}
</script>

<div>
	<form method="post" use:enhance={submitter}>
		<button formaction="/?/changeColor" class="color">
			<Color width="18" height="18" />
		</button>
		<button formaction="/?/changeTheme">
			{#if $page.data.theme === 'dark'}
				<LightMode width="18" height="18" />
			{:else}
				<DarkMode width="18" height="18" />
			{/if}
		</button>
	</form>
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
