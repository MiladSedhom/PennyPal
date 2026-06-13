<script lang="ts">
	import { resolve } from '$app/paths'
	import { page } from '$app/state'
	import { getAccountConnections, disconnectOAuth } from '$lib/remote/auth.remote'
	import Card from '$lib/components/pp/card.svelte'
	import Caption from '$lib/components/pp/caption.svelte'
	import { Button } from '$lib/components/ui/button'
	import { dialogs } from '$lib/components/pp/confirm-dialog'
	import GoogleIcon from '$lib/components/icons/google.svelte'
	import GithubIcon from '$lib/components/icons/github.svelte'
	import CheckIcon from '@lucide/svelte/icons/check'

	const connections = $derived(await getAccountConnections())

	const providers = [
		{ key: 'google', label: 'Google', Icon: GoogleIcon, connect: resolve('/login/google') },
		{ key: 'github', label: 'GitHub', Icon: GithubIcon, connect: resolve('/login/github') }
	] as const

	let notice = $state<string | null>(null)

	// Surface the outcome of a connect round-trip (?linked=… / ?error=in_use).
	const linked = $derived(page.url.searchParams.get('linked'))
	const linkError = $derived(page.url.searchParams.get('error'))

	function confirmDisconnect(key: 'google' | 'github', label: string) {
		dialogs.danger(
			async () => {
				const res = await disconnectOAuth(key)
				notice = res.ok ? null : res.message
			},
			{
				title: `Disconnect ${label}?`,
				message: `You'll no longer be able to sign in with ${label}.`,
				confirmText: 'Disconnect'
			}
		)
	}
</script>

<div class="px-10 pb-14 pt-2">
	<div class="mb-6">
		<h1 class="m-0 font-display text-[38px] font-bold tracking-[-0.04em] text-foreground">Account</h1>
		<p class="m-0 mt-2 text-[15.5px] text-text-dim">Manage how you sign in to PennyPal.</p>
	</div>

	<Card pad="none" class="max-w-[560px] overflow-hidden">
		<div class="border-b border-border-soft px-6 pb-4 pt-5">
			<span class="font-display text-[19px] font-semibold tracking-[-0.02em]">Connected accounts</span>
			<Caption class="mt-1 block">Link a provider to sign in with one click.</Caption>
		</div>

		{#if linked}
			<div
				class="mx-6 mt-4 rounded-[10px] border border-lime/40 bg-mint/40 px-3 py-2 text-[12.5px] font-medium text-foreground"
			>
				{linked === 'google' ? 'Google' : 'GitHub'} connected.
			</div>
		{/if}
		{#if linkError === 'in_use'}
			<div
				class="mx-6 mt-4 rounded-[10px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-[12.5px] font-medium text-destructive"
			>
				That account is already linked to a different PennyPal user.
			</div>
		{/if}
		{#if notice}
			<div
				class="mx-6 mt-4 rounded-[10px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-[12.5px] font-medium text-destructive"
			>
				{notice}
			</div>
		{/if}

		{#each providers as p (p.key)}
			{@const connected = connections.providers.includes(p.key)}
			<div class="flex items-center gap-3.5 border-t border-border-soft px-6 py-4">
				<span
					class="inline-flex h-[38px] w-[38px] items-center justify-center rounded-[11px] bg-bg-warm text-foreground"
				>
					<p.Icon size={18} />
				</span>
				<div class="flex-1">
					<div class="text-[14.5px] font-semibold text-foreground">{p.label}</div>
					<Caption class="flex items-center gap-1">
						{#if connected}<CheckIcon size={12} class="text-lime-text" /> Connected{:else}Not connected{/if}
					</Caption>
				</div>
				{#if connected}
					<Button
						type="button"
						variant="outline"
						onclick={() => confirmDisconnect(p.key, p.label)}
						class="h-[36px] rounded-full bg-transparent px-4 text-[13px] font-semibold"
					>
						Disconnect
					</Button>
				{:else}
					<a
						href="{p.connect}?link=1"
						data-sveltekit-reload
						class="inline-flex h-[36px] items-center rounded-full bg-foreground px-4 text-[13px] font-semibold text-background no-underline hover:bg-foreground/90"
					>
						Connect
					</a>
				{/if}
			</div>
		{/each}
	</Card>
</div>
