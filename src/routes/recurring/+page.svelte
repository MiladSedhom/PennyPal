<script lang="ts">
	import { getRecurringPayments, deleteRecurringPayment, setRecurringPaused } from '#lib/remote/recurring.remote.js'
	import { getTags } from '#lib/remote/tags.remote.js'
	import RecurringEditDialog from '#lib/components/recurring-edit-dialog.svelte'
	import RecurringRenewDialog from '#lib/components/recurring-renew-dialog.svelte'

	import TagChip from '#lib/components/pp/tag-chip.svelte'
	import { Button } from '#lib/components/ui/button/index.js'
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js'
	import { dialogs } from '#lib/components/pp/confirm-dialog/index.js'
	import { formatCadence } from '#lib/recurrence.js'
	import { formatMoney } from '#lib/utils/index.js'

	import PlusIcon from '@lucide/svelte/icons/plus'
	import RepeatIcon from '@lucide/svelte/icons/repeat'
	import PencilIcon from '@lucide/svelte/icons/pencil'
	import Trash2Icon from '@lucide/svelte/icons/trash-2'
	import PauseIcon from '@lucide/svelte/icons/pause'
	import PlayIcon from '@lucide/svelte/icons/play'
	import CheckIcon from '@lucide/svelte/icons/check'
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis'

	const rules = $derived(await getRecurringPayments())
	const tags = $derived(await getTags())

	type Rule = (typeof rules)[number]

	let editing = $state<Rule | 'new' | null>(null)
	let paying = $state<Rule | null>(null)

	const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

	const isCompleted = (r: Rule) => r.endDate !== null && new Date(r.nextRunAt) > new Date(r.endDate)
	const canPayNow = (r: Rule) => r.rolling && !r.paused && !isCompleted(r)

	function status(r: Rule) {
		if (r.paused) return 'Paused'
		if (isCompleted(r)) return 'Completed'
		if (r.rolling) {
			return new Date(r.nextRunAt).getTime() <= Date.now()
				? 'Due now'
				: `Due ${dateFormatter.format(new Date(r.nextRunAt))}`
		}
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

<svelte:head>
	<title>Recurring · PennyPal</title>
</svelte:head>

<div class="px-4 pb-14 pt-4 md:px-10 md:pt-2">
	<div class="mb-[22px] flex items-end justify-between">
		<div>
			<span class="caption">{rules.length} rule{rules.length === 1 ? '' : 's'}</span>
			<h1 class="m-0 mt-1.5 font-display text-xl font-bold tracking-[-0.03em] text-foreground md:text-2xl">
				Recurring
			</h1>
		</div>
		<Button
			type="button"
			onclick={() => (editing = 'new')}
			class="h-[40px] gap-2 rounded-full bg-primary px-[18px] text-[13.5px] font-semibold text-primary-foreground hover:bg-primary/90"
		>
			<PlusIcon size={15} /> New rule
		</Button>
	</div>

	<div class="overflow-hidden rounded-card border bg-card">
		{#if rules.length === 0}
			<div class="flex flex-col items-center gap-3 px-6 py-16 text-center">
				<span class="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-faint">
					<RepeatIcon size={20} />
				</span>
				<div class="text-[14.5px] font-semibold">No recurring payments yet</div>
				<span class="caption">Rules create real payments on schedule — rent, internet, subscriptions.</span>
			</div>
		{:else}
			{#each rules as r, i (r.id)}
				{@const completed = isCompleted(r)}
				<div class={[i > 0 && 'border-t border-border', (r.paused || completed) && 'opacity-60']}>
					<div class="flex items-start gap-3 px-4 py-3 md:hidden">
						<div class="flex min-w-0 flex-1 flex-col gap-1.5">
							<div class="flex items-baseline gap-2">
								<span class="text-base font-semibold tabular-nums">{formatMoney(r.amount)}</span>
								<span class="truncate text-[13px] font-semibold text-muted-foreground">
									{formatCadence(r.interval, r.intervalCount)}
								</span>
							</div>
							{#if r.tags.length > 0}
								<span class="flex flex-wrap gap-1.5">
									{#each r.tags as t (t.id)}
										<TagChip name={t.name} color={t.color} icon={t.icon} size="sm" />
									{/each}
								</span>
							{/if}
							{#if r.note}
								<span class="min-w-0 break-words text-[13px] text-muted-foreground">{r.note}</span>
							{/if}
							<span class="caption {r.paused || completed ? '' : 'text-kit-navy!'}">{status(r)}</span>
						</div>
						<div class="flex shrink-0 items-center gap-1">
							{#if canPayNow(r)}
								<Button
									variant="secondary"
									size="sm"
									onclick={() => (paying = r)}
									class="h-7 rounded-full px-2.5 text-[11.5px] font-semibold"
								>
									<CheckIcon class="size-3" /> Pay now
								</Button>
							{/if}
							<DropdownMenu.Root>
								<DropdownMenu.Trigger>
									{#snippet child({ props })}
										<Button
											{...props}
											variant="ghost"
											size="icon-sm"
											class="rounded-full text-faint hover:text-foreground"
											aria-label="Rule actions"
										>
											<EllipsisIcon class="size-4" />
										</Button>
									{/snippet}
								</DropdownMenu.Trigger>
								<DropdownMenu.Content align="end">
									{#if !completed}
										<DropdownMenu.Item onSelect={() => setRecurringPaused({ id: r.id, paused: !r.paused })}>
											{#if r.paused}<PlayIcon /> Resume{:else}<PauseIcon /> Pause{/if}
										</DropdownMenu.Item>
									{/if}
									<DropdownMenu.Item onSelect={() => (editing = r)}>
										<PencilIcon /> Edit
									</DropdownMenu.Item>
									<DropdownMenu.Item variant="destructive" onSelect={() => confirmDelete(r)}>
										<Trash2Icon /> Delete
									</DropdownMenu.Item>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						</div>
					</div>

					<div class="group hidden items-center gap-4 px-6 py-4 md:flex">
						<div class="w-[88px] shrink-0 text-[16.5px] font-bold tabular-nums">{formatMoney(r.amount)}</div>

						<span class="flex shrink-0 flex-wrap items-center gap-1.5">
							{#each r.tags as t (t.id)}
								<TagChip name={t.name} color={t.color} icon={t.icon} size="sm" />
							{/each}
						</span>

						<div class="min-w-0 flex-1">
							<div class="truncate text-[15px] font-semibold">
								{formatCadence(r.interval, r.intervalCount)}
							</div>
							{#if r.note}
								<div class="truncate text-[12.5px] text-faint">{r.note}</div>
							{/if}
						</div>

						<span class="caption shrink-0 {r.paused || completed ? '' : 'text-kit-navy!'}">{status(r)}</span>

						{#if canPayNow(r)}
							<button
								type="button"
								onclick={() => (paying = r)}
								class="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-3.5 py-1.5 text-[12.5px] font-semibold text-foreground hover:bg-foreground/10"
							>
								<CheckIcon size={13} /> Pay now
							</button>
						{/if}

						<span class="flex shrink-0 items-center gap-0.5">
							{#if !completed}
								<button
									type="button"
									onclick={() => setRecurringPaused({ id: r.id, paused: !r.paused })}
									class="flex h-7 w-7 items-center justify-center rounded-full border-none bg-transparent text-faint hover:bg-muted hover:text-foreground"
									aria-label={r.paused ? 'Resume rule' : 'Pause rule'}
								>
									{#if r.paused}<PlayIcon size={14} />{:else}<PauseIcon size={14} />{/if}
								</button>
							{/if}
							<button
								type="button"
								onclick={() => (editing = r)}
								class="flex h-7 w-7 items-center justify-center rounded-full border-none bg-transparent text-faint hover:bg-muted hover:text-foreground"
								aria-label="Edit rule"
							>
								<PencilIcon size={14} />
							</button>
							<button
								type="button"
								onclick={() => confirmDelete(r)}
								class="flex h-7 w-7 items-center justify-center rounded-full border-none bg-transparent text-faint hover:bg-muted hover:text-destructive"
								aria-label="Delete rule"
							>
								<Trash2Icon size={14} />
							</button>
						</span>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>

<RecurringEditDialog rule={editing} {tags} onclose={() => (editing = null)} />
<RecurringRenewDialog rule={paying} onclose={() => (paying = null)} />
