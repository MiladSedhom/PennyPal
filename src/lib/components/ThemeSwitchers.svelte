<script lang="ts">
	import DarkMode from '$lib/components/svgs/DarkMode.svelte'
	import LightMode from '$lib/components/svgs/LightMode.svelte'
	import Color from '$lib/components/svgs/Color.svelte'
	import { page } from '$app/stores'
	import { enhance } from '$app/forms'

	$: theme = $page.data.theme
	$: color = $page.data.color

	const colors = ['green', 'pink', 'yellow', 'blue']

	const changeTheme = () => {
		theme = theme === 'dark' ? 'light' : 'dark'
	}

	const changeColor = () => {
		let nextColor = colors[(colors.indexOf(color) + 1) % colors.length]
		color = nextColor
	}
</script>

<div>
	<form action="?/changeTheme" method="post" use:enhance>
		<input type="hidden" name="theme" bind:value={theme} />
		<input type="hidden" name="color" bind:value={color} />
		<button class="color" on:click={changeColor}>
			<Color width="18" height="18" />
		</button>
		<button on:click={changeTheme}>
			{#if theme === 'dark'}
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
