<script lang="ts">
	import { page } from '$app/state'
	import { resolve } from '$app/paths'
	import { toggleMode } from 'mode-watcher'
	import SunIcon from '@lucide/svelte/icons/sun'
	import MoonIcon from '@lucide/svelte/icons/moon'
	import LogOutIcon from '@lucide/svelte/icons/log-out'
	import MenuIcon from '@lucide/svelte/icons/menu'
	import { getLoggedInUser, logout } from '$lib/remote/auth.remote'
	import Button from '$lib/components/ui/button/button.svelte'
	import * as Drawer from '$lib/components/ui/drawer'

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

	let menuOpen = $state(false)
</script>

{#if loggedInUser}
	<header class="px-4 py-4 md:px-10">
		<div class="flex items-center justify-between gap-6">
			<div class="flex items-center gap-8">
				<a href={resolve('/')} class="flex items-center gap-[11px] text-foreground no-underline">
					<span class="font-display text-2xl font-black tracking-[-0.04em] leading-none"
						>Penny<span class="text-primary">Pal</span></span
					>
				</a>
			</div>
			<nav class="hidden gap-1 md:flex">
				{#each nav as n (n.id)}
					{@const active = isCurrentActivePath(n.path)}
					<a
						href={resolve(n.path)}
						class={[
							'rounded-full p-2 text-xs font-semibold no-underline transition-colors',
							active ? 'text-primary' : ' hover:text-foreground text-muted-foreground'
						]}
					>
						{n.label}
					</a>
				{/each}
			</nav>
			<div class="hidden items-center gap-3 md:flex">
				<Button
					variant="ghost"
					onclick={toggleMode}
					class="relative inline-flex h-9.5 w-9.5 items-center justify-center rounded-full bg-card text-foreground"
					aria-label="Toggle theme"
				>
					<SunIcon class="h-4 w-4 scale-in dark:scale-out-reverse" />
					<MoonIcon class="absolute h-4 w-4 scale-out dark:scale-in" />
				</Button>
				<form {...logout}>
					<Button
						variant="ghost"
						type="submit"
						class="inline-flex h-9.5 w-9.5 items-center justify-center rounded-full bg-card text-foreground"
						aria-label="Log out"
					>
						<LogOutIcon class="h-4 w-4" />
					</Button>
				</form>
				<Button
					variant="ghost"
					href={resolve('/account')}
					class="inline-flex h-9.5 w-9.5 items-center justify-center rounded-full bg-muted text-md font-bold text-foreground no-underline font-display"
					aria-label="Account"
				>
					{initials}
				</Button>
			</div>

			<Drawer.Root bind:open={menuOpen} direction="right">
				<Drawer.Trigger>
					{#snippet child({ props })}
						<Button
							{...props}
							variant="ghost"
							class="inline-flex h-9.5 w-9.5 items-center justify-center rounded-full bg-card text-foreground md:hidden"
							aria-label="Open menu"
						>
							<MenuIcon class="h-4 w-4" />
						</Button>
					{/snippet}
				</Drawer.Trigger>
				<Drawer.Content class="p-4">
					<Drawer.Header class="p-0 pb-4 text-left">
						<Drawer.Title class="font-display text-xl font-black tracking-[-0.04em]">
							Penny<span class="text-primary">Pal</span>
						</Drawer.Title>
					</Drawer.Header>

					<nav class="flex flex-col gap-1">
						{#each nav as n (n.id)}
							{@const active = isCurrentActivePath(n.path)}
							<a
								href={resolve(n.path)}
								onclick={() => (menuOpen = false)}
								aria-current={active ? 'page' : undefined}
								class={[
									'rounded-input px-3 py-2.5 text-sm font-semibold no-underline',
									active ? 'bg-muted text-primary' : 'text-muted-foreground'
								]}
							>
								{n.label}
							</a>
						{/each}
					</nav>

					<Drawer.Footer class="mt-4 flex-row items-center gap-3 border-t border-border px-0 pb-0">
						<Button
							variant="ghost"
							href={resolve('/account')}
							onclick={() => (menuOpen = false)}
							class="inline-flex h-9.5 w-9.5 items-center justify-center rounded-full bg-muted font-display text-md font-bold text-foreground no-underline"
							aria-label="Account"
						>
							{initials}
						</Button>
						<span class="flex-1 text-sm font-semibold">{loggedInUser?.username}</span>
						<Button
							variant="ghost"
							onclick={toggleMode}
							class="relative inline-flex h-9.5 w-9.5 items-center justify-center rounded-full bg-card text-foreground"
							aria-label="Toggle theme"
						>
							<SunIcon class="h-4 w-4 scale-in dark:scale-out-reverse" />
							<MoonIcon class="absolute h-4 w-4 scale-out dark:scale-in" />
						</Button>
						<form {...logout.for('menu')}>
							<Button
								variant="ghost"
								type="submit"
								class="inline-flex h-9.5 w-9.5 items-center justify-center rounded-full bg-card text-foreground"
								aria-label="Log out"
							>
								<LogOutIcon class="h-4 w-4" />
							</Button>
						</form>
					</Drawer.Footer>
				</Drawer.Content>
			</Drawer.Root>
		</div>
	</header>
{/if}
