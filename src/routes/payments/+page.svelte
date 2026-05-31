<script lang="ts">
	import { getPayments } from '$lib/remote/payments.remote'
	import { getTags } from '$lib/remote/tags.remote'
	import PaymentsForm from '$lib/components/payments-form.svelte'
	import { SvelteDate, SvelteMap } from 'svelte/reactivity'

	import Card from '$lib/components/pp/card.svelte'
	import Caption from '$lib/components/pp/caption.svelte'
	import TagChip from '$lib/components/pp/tag-chip.svelte'
	import { getTagMeta, TAG_PALETTE } from '$lib/tag-meta'
	import { Button } from '$lib/components/ui/button'

	import SearchIcon from '@lucide/svelte/icons/search'
	import XIcon from '@lucide/svelte/icons/x'
	import ArrowUpRightIcon from '@lucide/svelte/icons/arrow-up-right'

	const payments = $derived(await getPayments())
	const tags = $derived(await getTags())

	const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

	type SortKey = 'date' | 'amount'

	let q = $state('')
	let activeTags = $state<string[]>([])
	let sort = $state<SortKey>('date')

	function toggleTag(name: string) {
		activeTags = activeTags.includes(name) ? activeTags.filter((t) => t !== name) : [...activeTags, name]
	}

	function toIsoDay(d: string | Date) {
		const dt = new SvelteDate(d)
		const tz = dt.getTimezoneOffset() * 60000
		return new SvelteDate(dt.getTime() - tz).toISOString().slice(0, 10)
	}

	const filtered = $derived.by(() => {
		let rows = payments.slice()
		if (activeTags.length) rows = rows.filter((r) => r.tags.some((t) => activeTags.includes(t.name)))
		if (q) {
			const s = q.toLowerCase()
			rows = rows.filter(
				(r) =>
					(r.note ?? '').toLowerCase().includes(s) ||
					r.tags.some((t) => t.name.toLowerCase().includes(s)) ||
					String(r.amount).includes(s)
			)
		}
		rows.sort((a, b) => {
			if (sort === 'amount') return b.amount - a.amount
			return new SvelteDate(b.createdAt).getTime() - new SvelteDate(a.createdAt).getTime()
		})
		return rows
	})

	const groups = $derived.by(() => {
		const m = new SvelteMap<string, typeof payments>()
		for (const p of filtered) {
			const k = toIsoDay(p.createdAt)
			const arr = m.get(k) ?? []
			arr.push(p)
			m.set(k, arr)
		}
		return [...m.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1))
	})

	const total = $derived(filtered.reduce((a, r) => a + r.amount, 0))

	const monthLabel = new SvelteDate().toLocaleString('en-US', { month: 'long', year: 'numeric' })

	function formatDate(iso: string) {
		const d = new SvelteDate(iso + 'T00:00:00')
		const today = new SvelteDate()
		today.setHours(0, 0, 0, 0)
		const diff = Math.round((today.getTime() - d.getTime()) / 86400000)
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
		const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
		const md = `${months[d.getMonth()]} ${d.getDate()}`
		if (diff === 0) return `Today · ${md}`
		if (diff === 1) return `Yesterday · ${md}`
		return `${wd[d.getDay()]} · ${md}`
	}

	function noteInitials(note: string | null, fallback: string) {
		const src = (note && note.trim()) || fallback
		return src
			.split(/[\s._-]+/)
			.map((w) => w[0] ?? '')
			.join('')
			.slice(0, 2)
			.toUpperCase()
	}
</script>

<div class="px-10 pb-14 pt-2">
	<div class="mb-[22px] flex items-end justify-between">
		<div>
			<Caption>{payments.length} payments · {monthLabel}</Caption>
			<h1 class="mt-1.5 font-display text-[38px] font-bold tracking-[-0.04em] text-foreground m-0">Payments</h1>
		</div>
		<div class="flex gap-2.5">
			<Button
				variant="outline"
				class="h-[40px] gap-2 rounded-full bg-transparent px-[18px] text-[13.5px] font-semibold"
			>
				<ArrowUpRightIcon size={15} /> Export
			</Button>
			<PaymentsForm />
		</div>
	</div>

	<!-- Filter bar -->
	<Card pad="md" class="mb-4">
		<div class="flex flex-wrap items-center gap-3">
			<div class="flex flex-1 min-w-[200px] items-center gap-2 rounded-full bg-bg-warm px-[14px] py-2">
				<SearchIcon size={14} class="text-text-mute" />
				<input
					bind:value={q}
					placeholder="Search notes, tags, amounts…"
					class="flex-1 border-none bg-transparent text-[13.5px] font-medium text-foreground outline-none placeholder:text-text-mute"
				/>
				{#if q}
					<button
						type="button"
						onclick={() => (q = '')}
						class="flex border-none bg-transparent p-0 text-text-mute"
						aria-label="Clear search"
					>
						<XIcon size={13} />
					</button>
				{/if}
			</div>
			<div class="inline-flex gap-1 rounded-full bg-bg-warm p-1">
				{#each [['date', 'Date'], ['amount', 'Amount']] as const as [k, lbl] (k)}
					<button
						type="button"
						onclick={() => (sort = k)}
						class="rounded-full border-none px-[14px] py-1.5 text-[12.5px] font-semibold"
						class:bg-card={sort === k}
						class:text-foreground={sort === k}
						class:shadow-xs={sort === k}
						class:bg-transparent={sort !== k}
						class:text-text-mute={sort !== k}
					>
						{lbl}
					</button>
				{/each}
			</div>
		</div>

		<div class="mt-3.5 flex flex-wrap items-center gap-2">
			<Caption class="mr-0.5">Filter</Caption>
			{#each tags as t (t.id)}
				{@const on = activeTags.includes(t.name)}
				{@const c = TAG_PALETTE[getTagMeta(t.name).color]}
				{@const Icon = getTagMeta(t.name).icon}
				<button
					type="button"
					onclick={() => toggleTag(t.name)}
					class="inline-flex items-center gap-1.5 rounded-full px-3 py-[5px] text-[12.5px] font-semibold"
					style:background={on ? c.bg : 'transparent'}
					style:color={on ? c.ink : 'var(--text-mute)'}
					style:border={on ? '1px solid transparent' : '1px solid var(--border-color)'}
				>
					<Icon size={12} />
					{t.name}
				</button>
			{/each}
			{#if activeTags.length > 0}
				<button
					type="button"
					onclick={() => (activeTags = [])}
					class="ml-1 border-none bg-transparent text-[12.5px] font-semibold text-lime-text"
				>
					Clear
				</button>
			{/if}
		</div>
	</Card>

	<!-- Table card -->
	<Card pad="none" class="overflow-hidden">
		<div
			class="grid gap-4 border-b border-border-soft px-6 py-[14px]"
			style:grid-template-columns="1.5fr 1.4fr 1fr 130px"
		>
			<Caption>Merchant</Caption>
			<Caption>Tags</Caption>
			<Caption>Note</Caption>
			<Caption class="text-right">Amount</Caption>
		</div>

		{#if groups.length === 0}
			<div class="px-6 py-12 text-center text-[14px] text-text-mute">No payments match your filters.</div>
		{/if}

		{#each groups as [day, rows] (day)}
			{@const dayTotal = rows.reduce((a, r) => a + r.amount, 0)}
			<div class="flex items-center gap-3 bg-bg-warm px-6 py-2.5">
				<Caption class="!text-foreground !font-bold">{formatDate(day)}</Caption>
				<div class="flex-1"></div>
				<Caption>{fmt.format(dayTotal)}</Caption>
			</div>
			{#each rows as r (r.id)}
				{@const merchantLabel = (r.note && r.note.trim()) || r.tags[0]?.name || 'Payment'}
				<div
					class="grid items-center gap-4 border-t border-border-soft px-6 py-[13px]"
					style:grid-template-columns="1.5fr 1.4fr 1fr 130px"
				>
					<span class="flex items-center gap-3">
						<span
							class="inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-mint text-[13px] font-bold text-foreground"
						>
							{noteInitials(r.note, r.tags[0]?.name ?? 'PP')}
						</span>
						<span class="text-[14px] font-semibold">{merchantLabel}</span>
					</span>
					<span class="flex flex-wrap gap-1.5">
						{#if r.tags.length > 0}
							{#each r.tags as tag (tag.id)}
								<TagChip name={tag.name} size="sm" />
							{/each}
						{:else}
							<span class="text-[13px] text-text-mute">Untagged</span>
						{/if}
					</span>
					<span class="text-[13px]" class:text-text-dim={r.note} class:text-text-mute={!r.note}>
						{r.note || '—'}
					</span>
					<span class="text-right text-[14.5px] font-semibold tabular-nums">{fmt.format(r.amount)}</span>
				</div>
			{/each}
		{/each}

		<div class="flex items-center justify-between border-t border-border px-6 py-4">
			<Caption>{filtered.length} of {payments.length} shown</Caption>
			<div class="flex items-baseline gap-2.5">
				<Caption>Total</Caption>
				<span class="font-display text-[22px] font-bold tracking-[-0.02em] tabular-nums">{fmt.format(total)}</span>
			</div>
		</div>
	</Card>
</div>
