<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog'
	import { dialogs, type ConfirmTone } from './store.svelte'
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle'

	const current = $derived(dialogs.current)

	const actionVariant: Record<ConfirmTone, 'destructive' | 'outline' | 'default'> = {
		danger: 'destructive',
		warning: 'outline',
		info: 'default'
	}

	const toneRing: Record<ConfirmTone, string> = {
		danger: 'bg-destructive/10 text-destructive',
		warning: 'bg-warn/10 text-warn',
		info: 'bg-mint text-foreground'
	}
</script>

<AlertDialog.Root
	open={dialogs.open}
	onOpenChange={(open) => {
		// Closing via overlay/escape counts as a cancel; ignore while pending.
		if (!open && !dialogs.pending) dialogs.cancel()
	}}
>
	<AlertDialog.Content class="gap-4 rounded-2xl" interactOutsideBehavior={dialogs.pending ? 'ignore' : 'close'}>
		{#if current}
			<AlertDialog.Header>
				<div class="flex items-start gap-3.5">
					{#if current.icon}
						{@const Icon = current.icon}
						<span
							class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full {toneRing[current.tone]}"
						>
							<Icon size={19} />
						</span>
					{/if}
					<div class="flex flex-col gap-1.5">
						<AlertDialog.Title class="font-display text-[18px] font-bold tracking-[-0.02em]">
							{current.title}
						</AlertDialog.Title>
						<AlertDialog.Description class="text-[13.5px] leading-normal text-text-dim">
							{current.message}
						</AlertDialog.Description>
					</div>
				</div>
			</AlertDialog.Header>

			<AlertDialog.Footer class="gap-2">
				<AlertDialog.Cancel
					class="h-[40px] rounded-full bg-transparent px-[18px] text-[13.5px] font-semibold"
					disabled={dialogs.pending}
				>
					{current.cancelText}
				</AlertDialog.Cancel>
				<AlertDialog.Action
					variant={actionVariant[current.tone]}
					class="h-[40px] gap-2 rounded-full px-[18px] text-[13.5px] font-semibold"
					disabled={dialogs.pending}
					onclick={(e) => {
						// Keep the dialog open until the (possibly async) handler settles.
						e.preventDefault()
						dialogs.runConfirm()
					}}
				>
					{#if dialogs.pending}
						<LoaderCircleIcon size={15} class="animate-spin" />
					{/if}
					{current.confirmText}
				</AlertDialog.Action>
			</AlertDialog.Footer>
		{/if}
	</AlertDialog.Content>
</AlertDialog.Root>
