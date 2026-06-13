<script lang="ts">
	import { Button } from '$lib/components/ui/button'
	import { chooseUsername } from '$lib/remote/auth.remote'
	import Card from '$lib/components/pp/card.svelte'
	import Caption from '$lib/components/pp/caption.svelte'
	import WalletIcon from '@lucide/svelte/icons/wallet'
	import LoaderIcon from '@lucide/svelte/icons/loader-circle'
	import GoogleIcon from '$lib/components/icons/google.svelte'
	import GithubIcon from '$lib/components/icons/github.svelte'

	let { data } = $props()

	const error = $derived(chooseUsername.fields.allIssues()?.at(0) ?? null)
	const busy = $derived(chooseUsername.pending > 0)
</script>

<div class="flex min-h-screen items-center justify-center bg-background p-6">
	<Card pad="none" class="w-full max-w-[420px] overflow-hidden shadow-lg">
		<div class="border-b border-border-soft px-8 py-6">
			<div class="flex items-center gap-[11px]">
				<span class="inline-flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-foreground text-lime">
					<WalletIcon size={16} />
				</span>
				<span class="font-display text-[21px] font-bold tracking-[-0.04em]">PennyPal</span>
			</div>
			<Caption class="mt-3 flex items-center gap-1.5">
				{#if data.provider === 'google'}<GoogleIcon size={13} />{:else}<GithubIcon size={13} />{/if}
				Almost there — pick a username to finish.
			</Caption>
		</div>

		<form
			{...chooseUsername.enhance(async ({ submit }) => void (await submit()))}
			class="flex flex-col gap-4 px-8 py-7"
		>
			<label class="flex flex-col gap-2">
				<Caption>Username</Caption>
				<input
					{...chooseUsername.fields.username.as('text', data.suggestedName)}
					autocomplete="username"
					placeholder="e.g. {data.suggestedName || 'penny_saver'}"
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

			<Button
				type="submit"
				disabled={busy}
				class="mt-1 h-[44px] gap-2 rounded-full bg-foreground px-[18px] text-[13.5px] font-semibold text-background hover:bg-foreground/90"
			>
				{#if busy}<LoaderIcon size={15} class="animate-spin" />{/if}
				Continue
			</Button>
		</form>
	</Card>
</div>
