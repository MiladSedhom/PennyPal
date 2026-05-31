<script lang="ts">
	import { Button } from '$lib/components/ui/button'
	import { loginOrRegister } from '$lib/remote/auth.remote'
	import Card from '$lib/components/pp/card.svelte'
	import Caption from '$lib/components/pp/caption.svelte'
	import WalletIcon from '@lucide/svelte/icons/wallet'

	const error = $derived(loginOrRegister.fields.allIssues()?.at(0) ?? null)
</script>

<div class="flex min-h-screen items-center justify-center bg-background p-6">
	<div class="w-full max-w-[440px]">
		<Card pad="none" class="overflow-hidden shadow-lg">
			<div class="border-b border-border-soft px-8 py-6">
				<div class="flex items-center gap-[11px]">
					<span class="inline-flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-foreground text-lime">
						<WalletIcon size={16} />
					</span>
					<span class="font-display text-[21px] font-bold tracking-[-0.04em]">PennyPal</span>
				</div>
				<Caption class="mt-3 block">Sign in or create your account</Caption>
			</div>

			<form {...loginOrRegister} class="flex flex-col gap-5 px-8 py-7">
				<label class="flex flex-col gap-2">
					<Caption>Username</Caption>
					<input
						{...loginOrRegister.fields.username.as('text')}
						class="rounded-[10px] border border-border bg-bg-warm px-[14px] py-[11px] text-[14px] font-medium text-foreground outline-none focus:border-primary"
					/>
				</label>
				<label class="flex flex-col gap-2">
					<Caption>Password</Caption>
					<input
						{...loginOrRegister.fields.password.as('password')}
						class="rounded-[10px] border border-border bg-bg-warm px-[14px] py-[11px] text-[14px] font-medium text-foreground outline-none focus:border-primary"
					/>
				</label>

				{#if error}
					<div
						class="rounded-[10px] border border-destructive/30 bg-destructive/10 px-3 py-2 text-[12.5px] font-medium text-destructive"
					>
						{error.message}
					</div>
				{/if}

				<div class="flex gap-2 pt-1">
					<Button
						class="h-[40px] flex-1 gap-2 rounded-full bg-foreground px-[18px] text-[13.5px] font-semibold text-background hover:bg-foreground/90"
						{...loginOrRegister.fields.action.as('submit', 'login')}
					>
						Sign in
					</Button>
					<Button
						class="h-[40px] flex-1 gap-2 rounded-full bg-mint px-[18px] text-[13.5px] font-semibold text-foreground hover:bg-mint-deep"
						{...loginOrRegister.fields.action.as('submit', 'register')}
					>
						Create account
					</Button>
				</div>
			</form>
		</Card>
	</div>
</div>
