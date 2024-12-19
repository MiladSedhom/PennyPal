<script lang="ts">
	import '@unocss/reset/tailwind.css'
	import 'virtual:uno.css'
	import '../global.css'
	import Themes from '$lib/themeSwitcher/Themes.svelte'
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<Themes />

<div class="bg-body text-text font-[var(--sans-serif)]">
	{@render children?.()}
</div>
