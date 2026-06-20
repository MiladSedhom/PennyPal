<script lang="ts">
	import { getLoggedInUser } from '$lib/remote/auth.remote'
	import { getPayments } from '$lib/remote/payments.remote'
	import { getTags } from '$lib/remote/tags.remote'
	import { getCurrentBudget } from '$lib/remote/budgets.remote'
	import { getRecurringPayments } from '$lib/remote/recurring.remote'
	import { formatCadence } from '$lib/recurrence'
	import PaymentsForm from '$lib/components/payments-form.svelte'
	import RecurringRenewDialog from '$lib/components/recurring-renew-dialog.svelte'
	import { resolve } from '$app/paths'
	import { SvelteDate, SvelteSet, SvelteMap } from 'svelte/reactivity'

	import Card from '$lib/components/pp/card.svelte'
	import Caption from '$lib/components/pp/caption.svelte'
	import TagIconChip from '$lib/components/pp/tag-icon-chip.svelte'
	import { getSwatch } from '$lib/tag-meta'
	import { formatMoney } from '$lib/utils'

	import CalendarIcon from '@lucide/svelte/icons/calendar'
	import WalletIcon from '@lucide/svelte/icons/wallet'
	import PieChartIcon from '@lucide/svelte/icons/pie-chart'
	import TrendingDownIcon from '@lucide/svelte/icons/trending-down'
	import PiggyBankIcon from '@lucide/svelte/icons/piggy-bank'
	import RepeatIcon from '@lucide/svelte/icons/repeat'
	import CheckIcon from '@lucide/svelte/icons/check'
	import SparklesIcon from '@lucide/svelte/icons/sparkles'
	import TriangleAlertIcon from '@lucide/svelte/icons/triangle-alert'
	import GaugeIcon from '@lucide/svelte/icons/gauge'

	const user = $derived(await getLoggedInUser())
	const payments = $derived(await getPayments())
	const tags = $derived(await getTags())
	const budget = $derived(await getCurrentBudget())
	const recurringRules = $derived(await getRecurringPayments())

	let paying = $state<{ id: number; amount: number; note: string | null } | null>(null)

	const now = new SvelteDate()
	const monthLabel = now.toLocaleString('en-US', { month: 'long', year: 'numeric' })
	const monthShort = now.toLocaleString('en-US', { month: 'short' })
	const dayLabel = now.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

	// The budget window bounds the figures; without a budget, fall back to the calendar month.
	const periodStart = $derived.by(() => {
		if (budget) {
			const d = new SvelteDate(budget.startMonth)
			d.setHours(0, 0, 0, 0)
			return d
		}
		return new SvelteDate(now.getFullYear(), now.getMonth(), 1)
	})
	const periodEnd = $derived.by(() => {
		if (budget?.endMonth) {
			const d = new SvelteDate(budget.endMonth)
			d.setHours(23, 59, 59, 999)
			return d
		}
		return new SvelteDate(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
	})

	const periodPayments = $derived(
		payments.filter((p) => {
			const t = new SvelteDate(p.createdAt).getTime()
			return t >= periodStart.getTime() && t <= periodEnd.getTime()
		})
	)

	const total = $derived(periodPayments.reduce((a, p) => a + p.amount, 0))

	const pctUsed = $derived(budget ? Math.min((total / budget.amount) * 100, 100) : 0)
	const remaining = $derived(budget ? Math.max(budget.amount - total, 0) : 0)
	const daysLeft = $derived(Math.max(Math.ceil((periodEnd.getTime() - now.getTime()) / 86_400_000), 0))

	const activeDays = $derived(new SvelteSet(periodPayments.map((p) => new SvelteDate(p.createdAt).toDateString())).size)
	const dailyAvg = $derived(periodPayments.length === 0 ? 0 : total / Math.max(activeDays, 1))

	const totalPeriodDays = $derived(
		Math.max(Math.round((periodEnd.getTime() - periodStart.getTime()) / 86_400_000) + 1, 1)
	)
	const projectedTotal = $derived(dailyAvg * totalPeriodDays)
	const projectedSavings = $derived(budget ? Math.max(budget.amount - projectedTotal, 0) : 0)

	// Spend per tag (full amount toward each of a payment's tags), within the period.
	const spendByTagId = $derived.by(() => {
		const m = new SvelteMap<number, number>()
		for (const p of periodPayments) for (const t of p.tags) m.set(t.id, (m.get(t.id) ?? 0) + p.amount)
		return m
	})

	// Spend share by tag, for the donut + breakdown (split across a payment's tags).
	type Slice = { name: string; color: string; val: number }
	const byTag = $derived.by(() => {
		const m = new SvelteMap<string, Slice>()
		for (const p of periodPayments) {
			const ts = p.tags.length ? p.tags : [{ id: -1, name: 'Untagged', color: 'sage', icon: 'Tag' }]
			for (const t of ts) {
				const cur = m.get(t.name) ?? { name: t.name, color: t.color, val: 0 }
				cur.val += p.amount / ts.length
				m.set(t.name, cur)
			}
		}
		return [...m.values()].sort((a, b) => b.val - a.val)
	})

	const donutSegments = $derived.by(() => {
		const top = byTag.slice(0, 3)
		const other = byTag.slice(3).reduce((a, s) => a + s.val, 0)
		const segs = top.map((s) => ({ name: s.name, val: s.val, color: getSwatch(s.color).ink }))
		// Theme-adaptive faint segment: contrasts with the ink card's bg in both light and dark mode.
		if (other > 0)
			segs.push({ name: 'Other', val: other, color: 'color-mix(in srgb, var(--background) 32%, transparent)' })
		return segs
	})

	const R = 42
	const C = 2 * Math.PI * R
	const donutPaths = $derived.by(() => {
		let acc = 0
		const totalVal = donutSegments.reduce((a, s) => a + s.val, 0) || 1
		return donutSegments.map((s) => {
			const len = (s.val / totalVal) * C
			const dasharray = `${len} ${C - len}`
			const dashoffset = -acc
			acc += len
			return { ...s, dasharray, dashoffset }
		})
	})

	// Per-category budgets from the tags that have one set.
	const categoryBudgets = $derived(
		tags
			.filter((t) => t.budget != null)
			.map((t) => ({ ...t, spent: spendByTagId.get(t.id) ?? 0, budget: t.budget as number }))
			.sort((a, b) => b.spent / b.budget - a.spent / a.budget)
	)

	// 14-day spend trend from real payments.
	const trend = $derived.by(() => {
		const days: { date: SvelteDate; total: number }[] = []
		for (let i = 13; i >= 0; i--) {
			const d = new SvelteDate(now)
			d.setDate(now.getDate() - i)
			d.setHours(0, 0, 0, 0)
			days.push({ date: d, total: 0 })
		}
		for (const p of payments) {
			const pd = new SvelteDate(p.createdAt)
			pd.setHours(0, 0, 0, 0)
			const idx = days.findIndex((d) => d.date.getTime() === pd.getTime())
			if (idx >= 0) days[idx].total += p.amount
		}
		return days
	})
	const trendMax = $derived(Math.max(...trend.map((d) => d.total), 1))

	// Upcoming — the next occurrence of each active recurring rule.
	const upcoming = $derived.by(() => {
		return recurringRules
			.filter((r) => !r.paused && !(r.endDate && new SvelteDate(r.nextRunAt) > new SvelteDate(r.endDate)))
			.map((r) => {
				const next = new SvelteDate(r.nextRunAt)
				const diff = Math.round((next.getTime() - now.getTime()) / 86_400_000)
				const due = diff <= 0 ? 'Due' : diff === 1 ? 'Tomorrow' : `in ${diff}d`
				return {
					id: r.id,
					rolling: r.rolling,
					note: r.note || formatCadence(r.interval, r.intervalCount),
					color: r.tags[0]?.color ?? 'sage',
					icon: r.tags[0]?.icon ?? 'Repeat',
					amount: r.amount,
					whenLabel: next.toLocaleString('en-US', { month: 'short', day: 'numeric' }),
					due,
					diff
				}
			})
			.sort((a, b) => a.diff - b.diff)
			.slice(0, 4)
	})

	// Insights derived from real data.
	type Insight = { tone: 'warn' | 'good' | 'info'; icon: typeof GaugeIcon; head: string; body: string }
	const insights = $derived.by(() => {
		const out: Insight[] = []
		const over = categoryBudgets.find((c) => c.spent > c.budget)
		if (over) {
			out.push({
				tone: 'warn',
				icon: TriangleAlertIcon,
				head: `${over.name} is over budget`,
				body: `${formatMoney(over.spent)} of ${formatMoney(over.budget)} spent.`
			})
		}
		if (budget) {
			out.push({
				tone: projectedTotal <= budget.amount ? 'good' : 'warn',
				icon: GaugeIcon,
				head: projectedTotal <= budget.amount ? 'On track for the month' : 'Trending over budget',
				body: `Projected ${formatMoney(projectedTotal)} at the current pace.`
			})
		}
		if (upcoming.length) {
			const sum = upcoming.reduce((a, b) => a + b.amount, 0)
			out.push({
				tone: 'info',
				icon: RepeatIcon,
				head: `${upcoming.length} upcoming payment${upcoming.length === 1 ? '' : 's'}`,
				body: `About ${formatMoney(sum)} due over the next month.`
			})
		}
		return out.slice(0, 3)
	})

	const totalDisplay = $derived(total.toLocaleString('en-US'))
</script>

<div class="px-10 pb-12 pt-2">
	<div class="mb-[22px] flex items-end justify-between">
		<div>
			<Caption>{dayLabel}</Caption>
			<h1 class="m-0 mt-1.5 font-display text-[40px] font-bold leading-[1.05] tracking-[-0.04em] text-foreground">
				Good evening, {user?.username}
			</h1>
		</div>
		<div class="flex gap-2.5">
			<span
				class="inline-flex h-[40px] items-center gap-2 rounded-full border border-border-soft bg-transparent px-[18px] text-[13.5px] font-semibold text-foreground"
			>
				<CalendarIcon size={15} />
				{monthLabel}
			</span>
			<PaymentsForm />
		</div>
	</div>

	<!-- Row 1: hero spend + dark donut + two stat cards -->
	<div class="mb-4 grid gap-4 lg:grid-cols-[1.5fr_1.1fr_1fr]">
		<!-- Mint hero -->
		<Card tone="mint" class="flex min-h-[260px] flex-col justify-between">
			<div class="flex items-center justify-between">
				<span class="inline-flex items-center gap-2 text-[13.5px] font-semibold">
					<WalletIcon size={15} /> Spent in {monthShort}
				</span>
				{#if budget}
					<Caption>of {formatMoney(budget.amount)} budget</Caption>
				{/if}
			</div>
			<div>
				<div class="font-display text-[60px] font-bold leading-none tracking-[-0.045em]">${totalDisplay}</div>
				{#if budget}
					<div class="mt-4 h-2 overflow-hidden rounded-full bg-foreground/12">
						<div class="h-full rounded-full bg-foreground" style:width="{pctUsed}%"></div>
					</div>
					<div class="mt-2 flex justify-between">
						<Caption class="!text-text-ink-soft">{pctUsed.toFixed(0)}% used · {daysLeft} days left</Caption>
						<Caption class="!text-lime-text">{formatMoney(remaining)} remaining</Caption>
					</div>
				{:else}
					<div class="mt-4">
						<Caption class="!text-text-ink-soft">No active budget for this period</Caption>
					</div>
				{/if}
			</div>
		</Card>

		<!-- Dark donut card -->
		<Card tone="ink" class="flex min-h-[260px] flex-col">
			<span class="inline-flex items-center gap-2 text-[13.5px] font-semibold text-background/85">
				<PieChartIcon size={15} /> Where it went
			</span>
			{#if donutPaths.length > 0}
				<div class="mt-[18px] flex flex-1 items-center gap-[18px]">
					<svg width="104" height="104" viewBox="0 0 104 104" class="shrink-0">
						<g transform="rotate(-90 52 52)">
							{#each donutPaths as p, i (i)}
								<circle
									cx="52"
									cy="52"
									r={R}
									fill="none"
									stroke={p.color}
									stroke-width="16"
									stroke-dasharray={p.dasharray}
									stroke-dashoffset={p.dashoffset}
								/>
							{/each}
						</g>
						<text
							x="52"
							y="58"
							text-anchor="middle"
							font-size="12"
							font-weight="700"
							fill="currentColor"
							font-family="Inter">{monthShort}</text
						>
					</svg>
					<div class="flex flex-1 flex-col gap-[9px]">
						{#each donutPaths as p (p.name)}
							{@const pct = total > 0 ? (p.val / total) * 100 : 0}
							<div class="flex items-center gap-[9px] text-[13px]">
								<span class="inline-block h-[9px] w-[9px] rounded-full" style:background={p.color}></span>
								<span class="flex-1 text-background/80">{p.name}</span>
								<span class="font-semibold">{pct.toFixed(0)}%</span>
							</div>
						{/each}
					</div>
				</div>
			{:else}
				<div class="flex flex-1 items-center justify-center text-[13px] text-background/55">
					No spending yet this period
				</div>
			{/if}
		</Card>

		<!-- Stacked stat cards -->
		<div class="flex flex-col gap-4">
			<Card class="flex min-h-[122px] flex-col justify-between" pad="lg">
				<span class="inline-flex items-center gap-[7px] text-[12.5px] font-semibold text-text-dim">
					<TrendingDownIcon size={14} /> Daily average
				</span>
				<div>
					<div class="font-display text-[30px] font-bold leading-none tracking-[-0.03em]">{formatMoney(dailyAvg)}</div>
					<div class="mt-[5px] text-[12px] font-medium text-text-mute">
						Across {activeDays} active day{activeDays === 1 ? '' : 's'}
					</div>
				</div>
			</Card>
			<Card class="flex min-h-[122px] flex-col justify-between" pad="lg">
				<span class="inline-flex items-center gap-[7px] text-[12.5px] font-semibold text-text-dim">
					<PiggyBankIcon size={14} /> Projected savings
				</span>
				<div>
					<div class="font-display text-[30px] font-bold leading-none tracking-[-0.03em]">
						{budget ? formatMoney(projectedSavings) : '—'}
					</div>
					<div class="mt-[5px] text-[12px] font-medium text-text-mute">
						{budget ? 'If pace holds' : 'Set a budget to project'}
					</div>
				</div>
			</Card>
		</div>
	</div>

	<RecurringRenewDialog
		rule={paying}
		onclose={() => (paying = null)}
		onsaved={() => getRecurringPayments().refresh()}
	/>

	<!-- Row 2: trend + insights -->
	<div class="mb-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
		<Card>
			<div class="mb-5 flex items-center justify-between">
				<span class="font-display text-[19px] font-semibold tracking-[-0.02em]">Spending trend</span>
				<Caption>Last 14 days</Caption>
			</div>
			<div class="flex h-[150px] items-end gap-2">
				{#each trend as d, i (i)}
					{@const h = d.total === 0 ? 4 : Math.max((d.total / trendMax) * 100, 8)}
					<div class="flex h-full flex-1 flex-col items-center justify-end gap-2">
						<div
							class="w-full rounded-md"
							style:height="{h}%"
							style:background={i === trend.length - 1 ? 'var(--text)' : 'var(--mint-deep)'}
							style:min-height="4px"
						></div>
					</div>
				{/each}
			</div>
			<div class="mt-2.5 flex justify-between">
				<Caption>{trend[0].date.toLocaleString('en-US', { month: 'short', day: 'numeric' })}</Caption>
				<Caption>Today</Caption>
			</div>
		</Card>

		<Card class="flex flex-col">
			<span class="mb-4 font-display text-[19px] font-semibold tracking-[-0.02em]">Insights</span>
			{#if insights.length === 0}
				<div class="flex flex-1 items-center justify-center py-6 text-[13px] text-text-mute">
					<span class="inline-flex items-center gap-2"><SparklesIcon size={14} /> Add data to see insights</span>
				</div>
			{:else}
				<div class="flex flex-1 flex-col gap-3">
					{#each insights as ins, i (i)}
						{@const toneBg = ins.tone === 'warn' ? '#f3e2c9' : ins.tone === 'good' ? 'var(--mint)' : '#cfe0e8'}
						{@const toneInk = ins.tone === 'warn' ? '#8a5a1e' : ins.tone === 'good' ? 'var(--lime-text)' : '#2a5c71'}
						<div class="flex items-start gap-3">
							<span
								class="inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px]"
								style:background={toneBg}
								style:color={toneInk}
							>
								<ins.icon size={15} />
							</span>
							<div>
								<div class="text-[13.5px] font-semibold">{ins.head}</div>
								<div class="mt-0.5 text-[12.5px] leading-[1.45] text-text-dim">{ins.body}</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</Card>
	</div>

	<!-- Row 3: budgets by category + upcoming -->
	<div class="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
		<Card>
			<div class="mb-[18px] flex items-center justify-between">
				<span class="font-display text-[19px] font-semibold tracking-[-0.02em]">Budgets by category</span>
				<a
					href={resolve('/tags')}
					class="rounded-full border border-border-soft bg-transparent px-[13px] py-[7px] text-[12.5px] font-semibold text-foreground no-underline"
				>
					Manage
				</a>
			</div>
			{#if categoryBudgets.length === 0}
				<div class="py-8 text-center text-[13px] text-text-mute">
					No category budgets yet — set a monthly budget on a tag.
				</div>
			{:else}
				<div class="flex flex-col gap-4">
					{#each categoryBudgets as c (c.id)}
						{@const pct = Math.min((c.spent / c.budget) * 100, 100)}
						{@const over = c.spent > c.budget}
						{@const swatch = getSwatch(c.color)}
						<div>
							<div class="mb-[7px] flex items-center gap-3">
								<TagIconChip color={c.color} icon={c.icon} size={30} />
								<span class="flex-1 text-[14px] font-semibold">{c.name}</span>
								<span class="text-[13.5px] font-semibold tabular-nums">
									{formatMoney(c.spent)}
									<span class="font-medium text-text-mute">/ {formatMoney(c.budget)}</span>
								</span>
							</div>
							<div class="ml-[42px] h-[7px] overflow-hidden rounded-full bg-border-soft">
								<div
									class="h-full rounded-full"
									style:width="{pct}%"
									style:background={over ? 'var(--danger)' : swatch.ink}
								></div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</Card>

		<Card class="flex flex-col">
			<span class="mb-4 font-display text-[19px] font-semibold tracking-[-0.02em]">Upcoming</span>
			{#if upcoming.length === 0}
				<div class="flex flex-1 items-center justify-center py-6 text-[13px] text-text-mute">
					<a
						href={resolve('/recurring')}
						class="inline-flex items-center gap-2 text-text-mute no-underline hover:text-foreground"
					>
						<RepeatIcon size={14} /> No recurring payments — add one
					</a>
				</div>
			{:else}
				<div class="flex flex-col">
					{#each upcoming as b, i (i)}
						<div class="flex items-center gap-3 py-3" class:border-t={i > 0} class:border-border-soft={i > 0}>
							<TagIconChip color={b.color} icon={b.icon} size={32} />
							<div class="min-w-0 flex-1">
								<div class="truncate text-[13.5px] font-semibold">{b.note}</div>
								<Caption>{b.whenLabel}</Caption>
							</div>
							{#if b.rolling}
								<button
									type="button"
									onclick={() => (paying = b)}
									class="inline-flex items-center gap-1 rounded-full bg-mint px-3 py-1.5 text-[12px] font-semibold text-foreground hover:bg-mint-deep"
								>
									<CheckIcon size={12} /> Pay
								</button>
							{/if}
							<div class="text-right">
								<div class="text-[13.5px] font-semibold tabular-nums">{formatMoney(b.amount)}</div>
								<Caption class={b.due === 'Due' ? '!text-[color:var(--danger)]' : ''}>{b.due}</Caption>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</Card>
	</div>
</div>
