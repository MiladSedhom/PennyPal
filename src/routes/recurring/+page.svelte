<script lang="ts">
	import { getRecurringPayments, deleteRecurringPayment, setRecurringPaused } from '$lib/remote/recurring.remote'
	import { getTags } from '$lib/remote/tags.remote'
	import RecurringEditDialog from '$lib/components/recurring-edit-dialog.svelte'

	import Card from '$lib/components/pp/card.svelte'
	import Caption from '$lib/components/pp/caption.svelte'
	import TagChip from '$lib/components/pp/tag-chip.svelte'
	import TagIconChip from '$lib/components/pp/tag-icon-chip.svelte'
	import { Button } from '$lib/components/ui/button'
	import { dialogs } from '$lib/components/pp/confirm-dialog'
	import { formatCadence } from '$lib/recurrence'
	import { formatMoney } from '$lib/utils'

	import PlusIcon from '@lucide/svelte/icons/plus'
	import RepeatIcon from '@lucide/svelte/icons/repeat'
	import PencilIcon from '@lucide/svelte/icons/pencil'
	import Trash2Icon from '@lucide/svelte/icons/trash-2'
	import PauseIcon from '@lucide/svelte/icons/pause'
	import PlayIcon from '@lucide/svelte/icons/play'

	const rules = $derived(await getRecurringPayments())
	const tags = $derived(await getTags())

	type Rule = (typeof rules)[number]

	let editing = $state<Rule | 'new' | null>(null)

	const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

	const isCompleted = (r: Rule) => r.endDate !== null && new Date(r.nextRunAt) > new Date(r.endDate)

	function status(r: Rule) {
		if (r.paused) return 'Paused'
		if (isCompleted(r)) return 'Completed'
		return `Next: ${dateFormatter.format(new Date(r.nextRunAt))}`
	}

	function confirmDelete(r: Rule) {
		dialogs.danger(() => deleteRecurringPayment(r.id), {
			title: 'Delete this recurring payment?',
			message: `${formatMoney(r.amount)} ${formatCadence(r.interval, r.intervalCount).toLowerCase()}${r.note ? ` — “${r.note}”` : ''}. Payments it already created are kept.`,
			confirmText: 'Delete rule'
		})
	}
</script>

<div class="px-10 pb-14 pt-2">
	<div class="mb-[22px] flex items-end justify-between">
		<div>
			<Caption>{rules.length} rule{rules.length === 1 ? '' : 's'}</Caption>
			<h1 class="m-0 mt-1.5 font-display text-[38px] font-bold tracking-[-0.04em] text-foreground">Recurring</h1>
		</div>
		<Button
			type="button"
			onclick={() => (editing = 'new')}
			class="h-[40px] gap-2 rounded-full bg-foreground px-[18px] text-[13.5px] font-semibold text-background hover:bg-foreground/90"
		>
			<PlusIcon size={15} /> New rule
		</Button>
	</div>

	<Card pad="none" class="overflow-hidden">
		{#if rules.length === 0}
			<div class="flex flex-col items-center gap-3 px-6 py-16 text-center">
				<span class="flex h-12 w-12 items-center justify-center rounded-full bg-bg-warm text-text-mute">
					<RepeatIcon size={20} />
				</span>
				<div class="text-[14.5px] font-semibold">No recurring payments yet</div>
				<Caption>Rules create real payments on schedule — rent, internet, subscriptions.</Caption>
			</div>
		{:else}
			{#each rules as r, i (r.id)}
				{@const completed = isCompleted(r)}
				<div
					class="group flex items-center gap-4 px-6 py-4 {i > 0 ? 'border-t border-border-soft' : ''}"
					class:opacity-60={r.paused || completed}
				>
					{#if r.tags.length > 0}
						<TagIconChip color={r.tags[0].color} icon={r.tags[0].icon} size={36} />
					{:else}
						<span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg-warm text-text-dim">
							<RepeatIcon size={16} />
						</span>
					{/if}

					<div class="min-w-0 flex-1">
						<div class="truncate text-[14px] font-semibold">
							{r.note || formatCadence(r.interval, r.intervalCount)}
						</div>
						<Caption>{formatCadence(r.interval, r.intervalCount)}</Caption>
					</div>

					<span class="hidden flex-wrap items-center gap-1.5 sm:flex">
						{#each r.tags as t (t.id)}
							<TagChip name={t.name} color={t.color} icon={t.icon} size="sm" />
						{/each}
					</span>

					<div class="w-[170px] text-right">
						<div class="text-[14.5px] font-semibold tabular-nums">{formatMoney(r.amount)}</div>
						<Caption class={r.paused || completed ? '' : 'text-lime-text!'}>{status(r)}</Caption>
					</div>

					<span
						class="flex items-center gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100"
					>
						{#if !completed}
							<button
								type="button"
								onclick={() => setRecurringPaused({ id: r.id, paused: !r.paused })}
								class="flex h-7 w-7 items-center justify-center rounded-full border-none bg-transparent text-text-mute hover:bg-bg-warm hover:text-foreground"
								aria-label={r.paused ? 'Resume rule' : 'Pause rule'}
							>
								{#if r.paused}<PlayIcon size={14} />{:else}<PauseIcon size={14} />{/if}
							</button>
						{/if}
						<button
							type="button"
							onclick={() => (editing = r)}
							class="flex h-7 w-7 items-center justify-center rounded-full border-none bg-transparent text-text-mute hover:bg-bg-warm hover:text-foreground"
							aria-label="Edit rule"
						>
							<PencilIcon size={14} />
						</button>
						<button
							type="button"
							onclick={() => confirmDelete(r)}
							class="flex h-7 w-7 items-center justify-center rounded-full border-none bg-transparent text-text-mute hover:bg-bg-warm hover:text-(--danger)"
							aria-label="Delete rule"
						>
							<Trash2Icon size={14} />
						</button>
					</span>
				</div>
			{/each}
		{/if}
	</Card>
</div>

<RecurringEditDialog rule={editing} {tags} onclose={() => (editing = null)} />
