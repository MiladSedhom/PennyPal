<script lang="ts">
	import './layout.css'
	import favicon from '$lib/assets/favicon.svg'
	import { ModeWatcher, toggleMode } from 'mode-watcher'
	import { Button } from '$lib/components/ui/button'
	import SunIcon from '@lucide/svelte/icons/sun'
	import MoonIcon from '@lucide/svelte/icons/moon'
	import LogOutIcon from '@lucide/svelte/icons/log-out'
	import { getLoggedInUser, logout } from './(auth)/auth.remote'

	let { children } = $props()

	const loggedInUser = $derived(await getLoggedInUser())
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<ModeWatcher />

<div class="grid grid-cols-[5rem_auto] w-screen h-screen">
	<nav class="bg-accent flex flex-col items-center p-4 max-h-screen">
		<Button href="/" variant="outline" size="icon">
			<span class="font-black font-sans text-xl">P</span>
		</Button>
		<div class="mt-auto flex flex-col items-center gap-2">
			{#if loggedInUser}
				<form {...logout}>
					<Button type="submit" variant="outline" size="icon">
						<LogOutIcon class="h-[1.2rem] w-[1.2rem]" />
					</Button>
				</form>
			{/if}
			<Button onclick={toggleMode} variant="outline" size="icon">
				<SunIcon class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all! dark:scale-0 dark:-rotate-90" />
				<MoonIcon
					class="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all! dark:scale-100 dark:rotate-0"
				/>
				<span class="sr-only">Toggle theme</span>
			</Button>
		</div>
	</nav>
	<div class="overflow-auto">
		{@render children()}
	</div>
</div>
