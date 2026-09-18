<script lang="ts">
	import './layout.css'
	import favicon from '$lib/assets/favicon.svg'
	import { ModeWatcher } from 'mode-watcher'
	import { ConfirmDialog } from '$lib/components/pp/confirm-dialog'
	import Header from '$lib/components/header.svelte'

	let { children } = $props()
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
		rel="stylesheet"
	/>
</svelte:head>
<ModeWatcher />

<div class="flex min-h-screen w-full flex-col bg-background text-foreground">
	<Header />

	<main class="flex-1 overflow-auto max-w-[1980px] mx-auto">
		{@render children()}
	</main>
</div>

<ConfirmDialog />
