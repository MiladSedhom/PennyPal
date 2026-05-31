<script lang="ts">
	import { Button } from '$lib/components/ui/button'
	import { getLoggedInUser } from '$lib/remote/auth.remote'
	import { getPayments } from '$lib/remote/payments.remote'
	import { getTags } from '$lib/remote/tags.remote'
	import PaymentsForm from '$lib/components/payments-form.svelte'
	import { resolve } from '$app/paths'
	import { SvelteDate, SvelteSet } from 'svelte/reactivity'

	import Card from '$lib/components/pp/card.svelte'
	import Caption from '$lib/components/pp/caption.svelte'
	import TagIconChip from '$lib/components/pp/tag-icon-chip.svelte'
	import { getTagMeta, TAG_PALETTE } from '$lib/tag-meta'

	import CalendarIcon from '@lucide/svelte/icons/calendar'
	import WalletIcon from '@lucide/svelte/icons/wallet'
	import PieChartIcon from '@lucide/svelte/icons/pie-chart'
	import TrendingDownIcon from '@lucide/svelte/icons/trending-down'
	import PiggyBankIcon from '@lucide/svelte/icons/piggy-bank'
	import RepeatIcon from '@lucide/svelte/icons/repeat'
	import CoffeeIcon from '@lucide/svelte/icons/coffee'
	import DumbbellIcon from '@lucide/svelte/icons/dumbbell'
	import SparklesIcon from '@lucide/svelte/icons/sparkles'

	const user = $derived(await getLoggedInUser())
	const payments = $derived(await getPayments())
	const tags = $derived(await getTags())

	const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
	const fmtNoDec = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

	const now = new SvelteDate()
	const monthLabel = now.toLocaleString('en-US', { month: 'long', year: 'numeric' })
	const monthShort = now.toLocaleString('en-US', { month: 'short' })
	const dayLabel = now.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

	const total = $derived(payments.reduce((a, p) => a + p.amount, 0))

	// Naive monthly budget — until a budgets feature exists. Picked to comfortably exceed early-month spend.
	const monthlyBudget = 7500
	const pctUsed = $derived(Math.min((total / monthlyBudget) * 100, 100))
	const remaining = $derived(Math.max(monthlyBudget - total, 0))

	const daysInMonth = $derived(new SvelteDate(now.getFullYear(), now.getMonth() + 1, 0).getDate())
	const daysLeft = $derived(daysInMonth - now.getDate())

	const activeDays = $derived(new SvelteSet(payments.map((p) => new SvelteDate(p.createdAt).toDateString())).size)
	const dailyAvg = $derived(payments.length === 0 ? 0 : total / Math.max(activeDays, 1))

	const projectedTotal = $derived(dailyAvg * daysInMonth)
	const projectedSavings = $derived(Math.max(monthlyBudget - projectedTotal, 0))

	// Group spend by tag for the donut + breakdown
	const byTag = $derived.by(() => {
		const m: Record<string, number> = {}
		for (const p of payments) {
			const ts = p.tags.length ? p.tags : [{ id: -1, name: 'Untagged' }]
			for (const t of ts) m[t.name] = (m[t.name] ?? 0) + p.amount / ts.length
		}
		return Object.entries(m).sort((a, b) => b[1] - a[1])
	})

	const donutSegments = $derived.by(() => {
		const top = byTag.slice(0, 3)
		const other = byTag.slice(3).reduce((a, [, v]) => a + v, 0)
		const segs: { name: string; val: number; color: string }[] = top.map(([name, val]) => ({
			name,
			val,
			color: TAG_PALETTE[getTagMeta(name).color].ink
		}))
		if (other > 0) segs.push({ name: 'Other', val: other, color: 'rgba(255,255,255,0.28)' })
		return segs
	})

	// SVG donut math
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

	// 14-day spend trend
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

	// Category budgets — derived from top tags. Budget is a heuristic until users can set their own.
	const categoryBudgets = $derived.by(() => {
		return byTag.slice(0, 6).map(([name, spent]) => {
			// Pick a sensible "round" budget above current spend
			const target = Math.max(Math.ceil(spent / 50) * 50, 100)
			const budget = name.toLowerCase() === 'rent' ? spent : target
			return { name, spent, budget }
		})
	})

	// Insights — auto-derived
	type Tone = 'warn' | 'good' | 'info'
	const insights = $derived.by(() => {
		const out: { tone: Tone; icon: typeof DumbbellIcon; head: string; body: string }[] = []
		const over = categoryBudgets.find((c) => c.spent > c.budget && c.name.toLowerCase() !== 'rent')
		if (over) {
			out.push({
				tone: 'warn',
				icon: DumbbellIcon,
				head: `${over.name} is over budget`,
				body: `${fmt.format(over.spent)} of ${fmt.format(over.budget)}.`
			})
		}
		out.push({
			tone: 'good',
			icon: CoffeeIcon,
			head: 'Daily pace is healthy',
			body: `${fmt.format(dailyAvg)} per active day across ${payments.length} payments.`
		})
		out.push({
			tone: 'info',
			icon: RepeatIcon,
			head: `${tags.length} tags in rotation`,
			body: `${byTag.length} active this period.`
		})
		return out.slice(0, 3)
	})

	// Upcoming — synthesize from recent recurring-looking payments (subscriptions, rent, internet)
	const upcoming = $derived.by(() => {
		const seen = new SvelteSet<string>()
		const out: { merchant: string; tagName: string; amount: number; whenLabel: string; due: string }[] = []
		const recurringTags = new SvelteSet(['subscriptions', 'internet', 'utilities', 'rent', 'fitness'])
		for (const p of payments) {
			const recurring = p.tags.find((t) => recurringTags.has(t.name.toLowerCase()))
			if (!recurring) continue
			const key = `${recurring.name}-${p.amount}`
			if (seen.has(key)) continue
			seen.add(key)
			const next = new SvelteDate(p.createdAt)
			next.setMonth(next.getMonth() + 1)
			const diffDays = Math.round((next.getTime() - now.getTime()) / 86400000)
			let due = ''
			if (diffDays <= 0) due = 'Today'
			else if (diffDays === 1) due = 'Tomorrow'
			else due = `in ${diffDays}d`
			out.push({
				merchant: p.note || recurring.name,
				tagName: recurring.name,
				amount: p.amount,
				whenLabel: next.toLocaleString('en-US', { month: 'short', day: 'numeric' }),
				due
			})
			if (out.length >= 4) break
		}
		return out
	})

	const totalParts = $derived.by(() => {
		const fixed = total.toFixed(2)
		const [whole, dec] = fixed.split('.')
		return { whole: Number(whole).toLocaleString(), dec }
	})
</script>

<div class="px-10 pb-12 pt-2">
	<div class="mb-[22px] flex items-end justify-between">
		<div>
			<Caption>{dayLabel}</Caption>
			<h1 class="mt-1.5 font-display text-[40px] font-bold leading-[1.05] tracking-[-0.04em] text-foreground m-0">
				Good evening, {user?.username}
			</h1>
		</div>
		<div class="flex gap-2.5">
			<Button
				variant="outline"
				class="h-[40px] gap-2 rounded-full bg-transparent px-[18px] text-[13.5px] font-semibold"
			>
				<CalendarIcon size={15} />
				{monthLabel}
			</Button>
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
				<Caption>of {fmtNoDec.format(monthlyBudget)} budget</Caption>
			</div>
			<div>
				<div class="font-display text-[60px] font-bold leading-none tracking-[-0.045em]">
					${totalParts.whole}<span class="text-text-dim">.{totalParts.dec}</span>
				</div>
				<div class="mt-4 h-2 overflow-hidden rounded-full bg-foreground/12">
					<div class="h-full rounded-full bg-foreground" style:width="{pctUsed}%"></div>
				</div>
				<div class="mt-2 flex justify-between">
					<Caption class="!text-text-ink-soft">{pctUsed.toFixed(0)}% used · {daysLeft} days left</Caption>
					<Caption class="!text-lime-text">{fmtNoDec.format(remaining)} remaining</Caption>
				</div>
			</div>
		</Card>

		<!-- Dark donut card -->
		<Card tone="ink" class="flex min-h-[260px] flex-col">
			<span class="inline-flex items-center gap-2 text-[13.5px] font-semibold text-white/85">
				<PieChartIcon size={15} /> Where it went
			</span>
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
					<text x="52" y="50" text-anchor="middle" font-size="11" fill="rgba(255,255,255,0.6)" font-family="Inter"
						>{monthShort}</text
					>
					<text x="52" y="64" text-anchor="middle" font-size="13" font-weight="700" fill="#fff" font-family="Inter"
						>100%</text
					>
				</svg>
				<div class="flex flex-1 flex-col gap-[9px]">
					{#each donutPaths as p (p.name)}
						{@const pct = total > 0 ? (p.val / total) * 100 : 0}
						<div class="flex items-center gap-[9px] text-[13px]">
							<span class="inline-block h-[9px] w-[9px] rounded-full" style:background={p.color}></span>
							<span class="flex-1 text-white/80">{p.name}</span>
							<span class="font-semibold">{pct.toFixed(0)}%</span>
						</div>
					{/each}
				</div>
			</div>
		</Card>

		<!-- Stacked stat cards -->
		<div class="flex flex-col gap-4">
			<Card class="flex min-h-[122px] flex-col justify-between" pad="lg">
				<span class="inline-flex items-center gap-[7px] text-[12.5px] font-semibold text-text-dim">
					<TrendingDownIcon size={14} /> Daily average
				</span>
				<div>
					<div class="font-display text-[30px] font-bold leading-none tracking-[-0.03em]">
						{fmtNoDec.format(dailyAvg)}
					</div>
					<div class="mt-[5px] text-[12px] font-medium text-lime-text">
						Across {activeDays} active days
					</div>
				</div>
			</Card>
			<Card class="flex min-h-[122px] flex-col justify-between" pad="lg">
				<span class="inline-flex items-center gap-[7px] text-[12.5px] font-semibold text-text-dim">
					<PiggyBankIcon size={14} /> Projected savings
				</span>
				<div>
					<div class="font-display text-[30px] font-bold leading-none tracking-[-0.03em]">
						{fmtNoDec.format(projectedSavings)}
					</div>
					<div class="mt-[5px] text-[12px] font-medium text-text-mute">If pace holds</div>
				</div>
			</Card>
		</div>
	</div>

	<!-- Row 2: trend + insights -->
	<div class="mb-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
		<Card>
			<div class="mb-5 flex items-center justify-between">
				<span class="font-display text-[19px] font-semibold tracking-[-0.02em]">Spending trend</span>
				<div class="flex gap-1.5">
					{#each ['14D', '30D', '90D'] as range, i (range)}
						<span
							class="rounded-full px-[11px] py-[5px] text-[12px] font-semibold"
							class:bg-mint={i === 0}
							class:text-foreground={i === 0}
							class:text-text-mute={i !== 0}
						>
							{range}
						</span>
					{/each}
				</div>
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
		</Card>
	</div>

	<!-- Row 3: budgets + upcoming -->
	<div class="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
		<Card>
			<div class="mb-[18px] flex items-center justify-between">
				<span class="font-display text-[19px] font-semibold tracking-[-0.02em]">Budgets by category</span>
				<a
					href={resolve('/payments')}
					class="rounded-full border border-border-soft bg-transparent px-[13px] py-[7px] text-[12.5px] font-semibold text-foreground no-underline"
				>
					View all
				</a>
			</div>
			{#if categoryBudgets.length === 0}
				<div class="py-8 text-center text-[13px] text-text-mute">Add a few payments to see category budgets.</div>
			{:else}
				<div class="flex flex-col gap-4">
					{#each categoryBudgets as c (c.name)}
						{@const pct = Math.min((c.spent / c.budget) * 100, 100)}
						{@const over = c.spent > c.budget}
						{@const swatch = TAG_PALETTE[getTagMeta(c.name).color]}
						<div>
							<div class="mb-[7px] flex items-center gap-3">
								<TagIconChip name={c.name} size={30} />
								<span class="flex-1 text-[14px] font-semibold">{c.name}</span>
								<span class="text-[13.5px] font-semibold tabular-nums">
									{fmtNoDec.format(c.spent)}
									<span class="font-medium text-text-mute">/ {fmtNoDec.format(c.budget)}</span>
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
					<span class="inline-flex items-center gap-2">
						<SparklesIcon size={14} /> No recurring payments detected yet
					</span>
				</div>
			{:else}
				<div class="flex flex-col">
					{#each upcoming as b, i (i)}
						<div class="flex items-center gap-3 py-3" class:border-t={i > 0} class:border-border-soft={i > 0}>
							<TagIconChip name={b.tagName} size={32} />
							<div class="flex-1">
								<div class="text-[13.5px] font-semibold">{b.merchant}</div>
								<Caption>{b.whenLabel}</Caption>
							</div>
							<div class="text-right">
								<div class="text-[13.5px] font-semibold tabular-nums">{fmt.format(b.amount)}</div>
								<Caption class={b.due === 'Today' ? '!text-[color:var(--danger)]' : ''}>{b.due}</Caption>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</Card>
	</div>
</div>
