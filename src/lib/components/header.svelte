<script lang="ts">
	import { page } from '$app/state'
	import { resolve } from '$app/paths'
	import { toggleMode } from 'mode-watcher'
	import SunIcon from '@lucide/svelte/icons/sun'
	import MoonIcon from '@lucide/svelte/icons/moon'
	import LogOutIcon from '@lucide/svelte/icons/log-out'
	import { getLoggedInUser, logout } from '$lib/remote/auth.remote'
	import Button from '$lib/components/ui/button/button.svelte'

	const nav = [
		{ id: 'dashboard', label: 'Dashboard', path: '/' as const },
		{ id: 'payments', label: 'Payments', path: '/payments' as const },
		{ id: 'recurring', label: 'Recurring', path: '/recurring' as const },
		{ id: 'tags', label: 'Tags', path: '/tags' as const }
	]

	const loggedInUser = $derived(await getLoggedInUser())

	function isCurrentActivePath(path: string) {
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

<header class="px-10 py-4 border-b">
	<div class="flex items-center justify-between gap-6">
		<div class="flex items-center gap-8">
			<a href={resolve('/')} class="flex items-center gap-[11px] text-foreground no-underline">
				<span class="font-display text-2xl font-black tracking-[-0.04em] leading-none"
					>Penny<span class="text-primary">Pal</span></span
				>
			</a>
		</div>
		<nav class="flex gap-1">
			<span
				class="
				absolute
				top-0
				left-0
				height-100
				overflow-hidden
				pointer-events-none
				transition-transform
				cubic-bezier(.65,0,.35,1)
				transition-width
				cubic-bezier(.65,0,.35,1)
"
			></span>
			{#each nav as n (n.id)}
				{@const active = isCurrentActivePath(n.path)}
				<a
					href={resolve(n.path)}
					class={[
						'rounded-full p-2 text-xs font-semibold no-underline transition-colors',
						active ? 'text-primary' : ' hover:text-foreground text-text-dim'
					]}
				>
					{n.label}
				</a>
			{/each}
		</nav>
		<div class="flex items-center gap-3">
			<Button
				variant="ghost"
				onclick={toggleMode}
				class="relative inline-flex h-[38px] w-[38px] items-center justify-center rounded-full bg-card text-foreground"
				aria-label="Toggle theme"
			>
				<SunIcon class="h-[1rem] w-[1rem] scale-in dark:scale-out-reverse" />
				<MoonIcon class="absolute h-[1rem] w-[1rem] scale-out dark:scale-in" />
			</Button>
			<form {...logout}>
				<Button
					variant="ghost"
					type="submit"
					class="inline-flex h-[38px] w-[38px] items-center justify-center rounded-full bg-card text-foreground"
					aria-label="Log out"
				>
					<LogOutIcon class="h-[1rem] w-[1rem]" />
				</Button>
			</form>
			<Button
				variant="ghost"
				href={resolve('/account')}
				class="inline-flex h-[38px] w-[38px] items-center justify-center rounded-full bg-mint text-md font-bold text-foreground no-underline font-display"
				aria-label="Account"
			>
				{initials}
			</Button>
		</div>
	</div>
</header>
