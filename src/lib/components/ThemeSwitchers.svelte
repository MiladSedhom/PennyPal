<script lang="ts">
	import DarkMode from '$lib/components/svgs/DarkMode.svelte'
	import LightMode from '$lib/components/svgs/LightMode.svelte'
	import Color from '$lib/components/svgs/Color.svelte'
	import { themeSwticher } from '$lib/theme/themes.svelte'

	const color = themeSwticher(['green', 'pink', 'orange', 'blue'], 'color', 'blue')
	const theme = themeSwticher(['dark', 'light'], 'theme', 'dark')
</script>

<div>
	<form>
		<button
			class="color"
			onclick={() => {
				color.next()
			}}
		>
			<Color width="20px" height="20px" />
		</button>
		<button
			onclick={() => {
				theme.next()
			}}
		>
			{#if theme.current === 'dark'}
				<LightMode width="20px" height="20px" />
			{:else}
				<DarkMode width="20px" height="20px" />
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
		padding: 0.25rem;
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
