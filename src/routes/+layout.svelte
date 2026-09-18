<script lang="ts">
	import './layout.css'
	import favicon from '$lib/assets/favicon.svg'
	import { ModeWatcher } from 'mode-watcher'
	import { ConfirmDialog } from '$lib/components/pp/confirm-dialog'
	import Header from '$lib/components/header.svelte'

	let { children } = $props()

	let pointerPosition = $state({ x: -9999, y: -9999 })
</script>

<svelte:window onpointermove={(event) => (pointerPosition = { x: event.clientX, y: event.clientY })} />

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

<div class="relative isolate flex min-h-screen w-full flex-col bg-background text-foreground">
	<div
		aria-hidden="true"
		class="grid-backdrop pointer-events-none fixed inset-0 -z-10"
		style:--pointer-x="{pointerPosition.x}px"
		style:--pointer-y="{pointerPosition.y}px"
	></div>
	<Header />

	<main class="flex-1 overflow-auto w-full max-w-[1440px] mx-auto">
		{@render children()}
	</main>
</div>

<ConfirmDialog />
