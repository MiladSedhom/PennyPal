<script lang="ts">
	import { Button } from '$lib/components/ui/button'
	import { resolve } from '$app/paths'
	import { loginOrRegister } from '$lib/remote/auth.remote'
	import Card from '$lib/components/pp/card.svelte'
	import Caption from '$lib/components/pp/caption.svelte'
	import WalletIcon from '@lucide/svelte/icons/wallet'
	import EyeIcon from '@lucide/svelte/icons/eye'
	import EyeOffIcon from '@lucide/svelte/icons/eye-off'
	import LoaderIcon from '@lucide/svelte/icons/loader-circle'
	import GoogleIcon from '$lib/components/icons/google.svelte'
	import GithubIcon from '$lib/components/icons/github.svelte'

	let mode = $state<'login' | 'register'>('login')
	let showPassword = $state(false)

	const error = $derived(loginOrRegister.fields.allIssues()?.at(0) ?? null)
	const busy = $derived(loginOrRegister.pending > 0)

	const oauthBtn =
		'inline-flex h-[44px] items-center justify-center gap-2.5 rounded-full border border-border bg-bg-warm px-[18px] ' +
		'text-[13.5px] font-semibold text-foreground transition-colors hover:bg-mint'
</script>

<Card pad="none" class="w-full max-w-[420px] overflow-hidden shadow-lg">
	<div class="border-b border-border-soft px-8 py-6">
		<div class="flex items-center gap-[11px]">
			<span class="inline-flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-foreground text-lime">
				<WalletIcon size={16} />
			</span>
			<span class="font-display text-[21px] font-bold tracking-[-0.04em]">PennyPal</span>
		</div>
		<Caption class="mt-3 block">
			{mode === 'login' ? 'Welcome back — sign in to your account.' : 'Create your account to start tracking.'}
		</Caption>
	</div>

	<div class="flex flex-col gap-5 px-8 py-7">
		<!-- Sign in / Create account toggle -->
		<div class="inline-flex gap-1 rounded-full bg-bg-warm p-1" role="tablist">
			{#each [['login', 'Sign in'], ['register', 'Create account']] as const as [key, label] (key)}
				<button
					type="button"
					role="tab"
					aria-selected={mode === key}
					onclick={() => (mode = key)}
					class="flex-1 rounded-full border-none px-4 py-2 text-[13px] font-semibold transition-colors"
					class:bg-card={mode === key}
					class:text-foreground={mode === key}
					class:shadow-xs={mode === key}
					class:bg-transparent={mode !== key}
					class:text-text-mute={mode !== key}
				>
					{label}
				</button>
			{/each}
		</div>

		<!-- OAuth -->
		<div class="flex flex-col gap-2.5">
			<a href={resolve('/login/google')} data-sveltekit-reload class={oauthBtn}>
				<GoogleIcon size={17} /> Continue with Google
			</a>
			<a href={resolve('/login/github')} data-sveltekit-reload class={oauthBtn}>
				<GithubIcon size={17} /> Continue with GitHub
			</a>
		</div>

		<div class="flex items-center gap-3">
			<span class="h-px flex-1 bg-border-soft"></span>
			<Caption>or with a username</Caption>
			<span class="h-px flex-1 bg-border-soft"></span>
		</div>

		<form {...loginOrRegister.enhance(async ({ submit }) => void (await submit()))} class="flex flex-col gap-4">
			<label class="flex flex-col gap-2">
				<Caption>Username</Caption>
				<input
					{...loginOrRegister.fields.username.as('text')}
					autocomplete="username"
					class="rounded-[10px] border border-border bg-bg-warm px-[14px] py-[11px] text-[14px] font-medium text-foreground outline-none focus:border-primary"
				/>
			</label>
			<label class="flex flex-col gap-2">
				<Caption>Password</Caption>
				<div class="relative flex items-center">
					<input
						{...loginOrRegister.fields.password.as(showPassword ? 'text' : 'password')}
						autocomplete={mode === 'login' ? 'current-password' : 'new-password'}
						class="w-full rounded-[10px] border border-border bg-bg-warm py-[11px] pl-[14px] pr-[42px] text-[14px] font-medium text-foreground outline-none focus:border-primary"
					/>
					<button
						type="button"
						onclick={() => (showPassword = !showPassword)}
						class="absolute right-[10px] flex border-none bg-transparent p-1 text-text-mute hover:text-foreground"
						aria-label={showPassword ? 'Hide password' : 'Show password'}
					>
						{#if showPassword}<EyeOffIcon size={16} />{:else}<EyeIcon size={16} />{/if}
					</button>
				</div>
			</label>

			{#if error}
				<div
					class="rounded-[10px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-[12.5px] font-medium text-destructive"
				>
					{error.message}
				</div>
			{/if}

			<Button
				{...loginOrRegister.fields.action.as('submit', mode)}
				disabled={busy}
				class="mt-1 h-[44px] gap-2 rounded-full bg-foreground px-[18px] text-[13.5px] font-semibold text-background hover:bg-foreground/90"
			>
				{#if busy}
					<LoaderIcon size={15} class="animate-spin" />
				{/if}
				{mode === 'login' ? 'Sign in' : 'Create account'}
			</Button>
		</form>
	</div>
</Card>
