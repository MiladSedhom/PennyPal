<script lang="ts">
	import './layout.css'
	import favicon from '$lib/assets/favicon.svg'
	import { page } from '$app/state'
	import { resolve } from '$app/paths'
	import { ModeWatcher, toggleMode } from 'mode-watcher'
	import SunIcon from '@lucide/svelte/icons/sun'
	import MoonIcon from '@lucide/svelte/icons/moon'
	import LogOutIcon from '@lucide/svelte/icons/log-out'
	import SearchIcon from '@lucide/svelte/icons/search'
	import WalletIcon from '@lucide/svelte/icons/wallet'
	import { getLoggedInUser, logout } from '../lib/remote/auth.remote'
	import { ConfirmDialog } from '$lib/components/pp/confirm-dialog'

	let { children } = $props()
	const loggedInUser = $derived(await getLoggedInUser())

	const nav = [
		{ id: 'dashboard', label: 'Dashboard', path: '/' as const },
		{ id: 'payments', label: 'Payments', path: '/payments' as const },
		{ id: 'tags', label: 'Tags', path: '/tags' as const }
	]

	function isActive(path: string) {
		if (path === '/') return page.url.pathname === '/'
		return page.url.pathname.startsWith(path)
	}

	const initials = $derived(
		(loggedInUser?.username ?? 'PP')
			.split(/[\s._-]+/)
			.map((w) => w[0])
			.join('')
			.slice(0, 2)
			.toUpperCase()
	)
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
	{#if loggedInUser}
		<header class="px-10 pt-[22px] pb-2">
			<div class="flex items-center justify-between gap-6">
				<div class="flex items-center gap-8">
					<a href={resolve('/')} class="flex items-center gap-[11px] text-foreground no-underline">
						<span
							class="inline-flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-foreground text-lime"
						>
							<WalletIcon size={16} />
						</span>
						<span class="font-display text-[21px] font-bold tracking-[-0.04em] leading-none">PennyPal</span>
					</a>
					<nav class="flex gap-1 rounded-full bg-card p-1 shadow-xs">
						{#each nav as n (n.id)}
							{@const active = isActive(n.path)}
							<a
								href={resolve(n.path)}
								class="rounded-full px-4 py-2 text-[13.5px] font-semibold no-underline transition-colors"
								class:bg-foreground={active}
								class:text-background={active}
								class:text-text-dim={!active}
								class:hover:text-foreground={!active}
							>
								{n.label}
							</a>
						{/each}
					</nav>
				</div>
				<div class="flex items-center gap-3">
					<span
						class="hidden items-center gap-2 rounded-full bg-card px-[14px] py-[9px] text-[13px] text-text-mute sm:inline-flex"
					>
						<SearchIcon size={14} /> Search…
					</span>
					<button
						type="button"
						onclick={toggleMode}
						class="relative inline-flex h-[38px] w-[38px] items-center justify-center rounded-full bg-card text-foreground"
						aria-label="Toggle theme"
					>
						<SunIcon class="h-[1rem] w-[1rem] scale-in dark:scale-out-reverse" />
						<MoonIcon class="absolute h-[1rem] w-[1rem] scale-out dark:scale-in" />
					</button>
					<form {...logout}>
						<button
							type="submit"
							class="inline-flex h-[38px] w-[38px] items-center justify-center rounded-full bg-card text-foreground"
							aria-label="Log out"
						>
							<LogOutIcon class="h-[1rem] w-[1rem]" />
						</button>
					</form>
					<a
						href={resolve('/account')}
						class="inline-flex h-[38px] w-[38px] items-center justify-center rounded-full bg-mint text-[13px] font-bold text-foreground no-underline"
						aria-label="Account"
					>
						{initials}
					</a>
				</div>
			</div>
		</header>
	{/if}
	<main class="flex-1 overflow-auto">
		{@render children()}
	</main>
</div>

<ConfirmDialog />
