<script lang="ts">
	import { getTags, createTag, updateTag, deleteTag } from '$lib/remote/tags.remote'
	import { getPayments } from '$lib/remote/payments.remote'

	import Card from '$lib/components/pp/card.svelte'
	import Caption from '$lib/components/pp/caption.svelte'
	import TagIconChip from '$lib/components/pp/tag-icon-chip.svelte'
	import { Button } from '$lib/components/ui/button'
	import { TAG_PALETTE, TAG_COLOR_LIST, ICON_CHOICES, ICON_LIBRARY, type TagColor } from '$lib/tag-meta'
	import { formatMoney } from '$lib/utils'

	import CheckIcon from '@lucide/svelte/icons/check'
	import PlusIcon from '@lucide/svelte/icons/plus'
	import PencilIcon from '@lucide/svelte/icons/pencil'
	import Trash2Icon from '@lucide/svelte/icons/trash-2'
	import SearchIcon from '@lucide/svelte/icons/search'
	import XIcon from '@lucide/svelte/icons/x'

	const tags = $derived(await getTags())
	const payments = $derived(await getPayments())

	let editingId = $state<number | null>(null)
	const form = $state<{
		name: string
		color: TagColor
		icon: (typeof ICON_CHOICES)[number]
		budget: number | null
		saving: boolean
	}>({
		name: '',
		color: 'sage',
		icon: 'Tag',
		budget: null,
		saving: false
	})

	let search = $state('')
	type TagSort = 'name' | 'count' | 'budget'
	let sort = $state<TagSort>('name')

	const sw = $derived(TAG_PALETTE[form.color])
	const PreviewIcon = $derived(ICON_LIBRARY[form.icon])

	const existing = $derived(
		tags.map((t) => ({
			...t,
			count: payments.filter((p) => p.tags.some((tt) => tt.id === t.id)).length
		}))
	)

	const displayed = $derived.by(() => {
		let rows = existing.slice()
		const q = search.trim().toLowerCase()
		if (q) rows = rows.filter((t) => t.name.toLowerCase().includes(q))
		rows.sort((a, b) => {
			if (sort === 'count') return b.count - a.count || a.name.localeCompare(b.name)
			if (sort === 'budget') return (b.budget ?? -1) - (a.budget ?? -1) || a.name.localeCompare(b.name)
			return a.name.localeCompare(b.name)
		})
		return rows
	})

	function resetForm() {
		editingId = null
		form.name = ''
		form.color = 'sage'
		form.icon = 'Tag'
		form.budget = null
	}

	function startEdit(t: (typeof existing)[number]) {
		editingId = t.id
		form.name = t.name
		form.color = (t.color in TAG_PALETTE ? t.color : 'sage') as TagColor
		form.icon = (ICON_CHOICES as readonly string[]).includes(t.icon) ? (t.icon as (typeof ICON_CHOICES)[number]) : 'Tag'
		form.budget = t.budget
	}

	async function save() {
		const trimmed = form.name.trim()
		if (!trimmed || form.saving) return
		form.saving = true
		try {
			const roundedBudget = form.budget ? Math.max(Math.round(form.budget), 0) : null
			const payload = { name: trimmed, color: form.color, icon: form.icon, budget: roundedBudget }
			if (editingId === null) {
				await createTag(payload)
			} else {
				await updateTag({ id: editingId, ...payload })
			}
			resetForm()
		} finally {
			form.saving = false
		}
	}

	async function remove(id: number) {
		await deleteTag(id)
		if (editingId === id) resetForm()
	}
</script>

<div class="px-10 pb-14 pt-2">
	<div class="mb-6">
		<h1 class="m-0 font-display text-[38px] font-bold tracking-[-0.04em] text-foreground">Tags</h1>
		<p class="mt-2 m-0 text-[15.5px] text-text-dim">
			Give every tag a color and an icon. They show up across your payments and insights.
		</p>
	</div>

	<div class="grid items-start gap-4 lg:grid-cols-[1fr_1.15fr]">
		<!-- Create / edit form -->
		<Card pad="xl" class="lg:sticky lg:top-4">
			<!-- Live preview -->
			<div class="mb-6 flex items-center gap-4 rounded-2xl bg-bg-warm p-5">
				<span
					class="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
					style:background={sw.bg}
					style:color={sw.ink}
				>
					<PreviewIcon size={26} />
				</span>
				<div class="flex-1">
					<Caption>{editingId === null ? 'New tag' : 'Editing'}</Caption>
					<div class="mt-0.5 font-display text-[24px] font-bold tracking-[-0.03em]">{form.name || 'Untitled'}</div>
				</div>
				<span
					class="inline-flex items-center gap-1.5 rounded-full px-3 py-[5px] text-[12.5px] font-semibold"
					style:background={sw.bg}
					style:color={sw.ink}
				>
					<PreviewIcon size={13} />
					{form.name || 'Tag'}
				</span>
			</div>

			<!-- Name + budget -->
			<div class="mb-[22px] grid gap-3 sm:grid-cols-[1.5fr_1fr]">
				<label class="block">
					<Caption class="mb-2 block">Name</Caption>
					<input
						bind:value={form.name}
						onkeydown={(e) => e.key === 'Enter' && save()}
						placeholder="e.g. Groceries"
						class="w-full rounded-sm border border-border bg-bg-warm px-[14px] py-[11px] text-[14px] font-medium text-foreground outline-none focus:border-primary"
					/>
				</label>
				<label class="block">
					<Caption class="mb-2 block">Monthly budget</Caption>
					<div class="relative flex items-center">
						<span class="absolute left-[14px] font-mono text-[14px] text-text-mute">$</span>
						<input
							bind:value={form.budget}
							onkeydown={(e) => e.key === 'Enter' && save()}
							inputmode="numeric"
							placeholder="—"
							class="w-full rounded-sm border border-border bg-bg-warm py-[11px] pl-[26px] pr-[14px] font-mono text-[14px] font-medium text-foreground outline-none focus:border-primary"
						/>
					</div>
				</label>
			</div>

			<!-- Color -->
			<div class="mb-[22px]">
				<Caption class="mb-2.5 block">Color</Caption>
				<div class="flex flex-wrap gap-2.5">
					{#each TAG_COLOR_LIST as id (id)}
						{@const s = TAG_PALETTE[id]}
						<button
							type="button"
							onclick={() => (form.color = id)}
							class="inline-flex h-[38px] w-[38px] items-center justify-center rounded-[11px]"
							style:background={s.bg}
							style:border={form.color === id ? `2px solid var(--text)` : '2px solid transparent'}
							aria-label={id}
						>
							{#if form.color === id}
								<span class="h-3.5 w-3.5 rounded-full" style:background={s.ink}></span>
							{/if}
						</button>
					{/each}
				</div>
			</div>

			<!-- Icon -->
			<div class="mb-[26px]">
				<Caption class="mb-2.5 block">Icon</Caption>
				<div class="grid grid-cols-8 gap-2">
					{#each ICON_CHOICES as ic (ic)}
						{@const Ico = ICON_LIBRARY[ic]}
						{@const on = form.icon === ic}
						<button
							type="button"
							onclick={() => (form.icon = ic)}
							class="inline-flex aspect-square items-center justify-center rounded-[11px]"
							style:background={on ? sw.bg : 'var(--bg-warm)'}
							style:color={on ? sw.ink : 'var(--text-dim)'}
							style:border={on ? `1px solid ${sw.ink}` : '1px solid transparent'}
							aria-label={ic}
						>
							<Ico size={17} />
						</button>
					{/each}
				</div>
			</div>

			<div class="flex gap-2.5">
				<Button
					type="button"
					onclick={save}
					disabled={!form.name.trim() || form.saving}
					class="h-[40px] flex-1 gap-2 rounded-full bg-foreground px-[18px] text-[13.5px] font-semibold text-background hover:bg-foreground/90"
				>
					<CheckIcon size={15} />
					{editingId === null ? 'Create tag' : 'Save changes'}
				</Button>
				{#if editingId !== null}
					<Button
						type="button"
						variant="outline"
						onclick={resetForm}
						class="h-[40px] gap-2 rounded-full bg-transparent px-[18px] text-[13.5px] font-semibold"
					>
						Cancel
					</Button>
					<Button
						type="button"
						onclick={() => editingId !== null && remove(editingId)}
						class="h-[40px] gap-2 rounded-full bg-transparent px-[18px] text-[13.5px] font-semibold text-(--danger) hover:bg-(--danger)/10"
						aria-label="Delete this tag"
					>
						<Trash2Icon size={15} />
					</Button>
				{/if}
			</div>
		</Card>

		<!-- Existing tags list -->
		<Card pad="none">
			<div class="flex items-center justify-between px-6 pb-4 pt-5">
				<span class="font-display text-[19px] font-semibold tracking-[-0.02em]">
					Your tags <span class="font-medium text-text-mute">· {existing.length}</span>
				</span>
				<Button
					type="button"
					onclick={resetForm}
					class="h-[32px] gap-1.5 rounded-full bg-mint px-3 text-[12.5px] font-semibold text-foreground hover:bg-mint-deep"
				>
					<PlusIcon size={13} /> New
				</Button>
			</div>

			<!-- Search + sort -->
			<div class="flex flex-wrap items-center gap-3 px-6 pb-4">
				<div class="flex min-w-[180px] flex-1 items-center gap-2 rounded-full bg-bg-warm px-[14px] py-2">
					<SearchIcon size={14} class="text-text-mute" />
					<input
						bind:value={search}
						placeholder="Search tags…"
						class="flex-1 border-none bg-transparent text-[13.5px] font-medium text-foreground outline-none placeholder:text-text-mute"
					/>
					{#if search}
						<button
							type="button"
							onclick={() => (search = '')}
							class="flex border-none bg-transparent p-0 text-text-mute"
							aria-label="Clear search"
						>
							<XIcon size={13} />
						</button>
					{/if}
				</div>
				<div class="inline-flex gap-1 rounded-full bg-bg-warm p-1">
					{#each [['name', 'Name'], ['count', 'Usage'], ['budget', 'Budget']] as const as [k, lbl] (k)}
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

			<div class="max-h-[calc(100vh-280px)] overflow-y-auto">
				{#if existing.length === 0}
					<div class="border-t border-border-soft px-6 py-12 text-center text-[13px] text-text-mute">
						You don't have any tags yet — create your first on the left.
					</div>
				{:else if displayed.length === 0}
					<div class="border-t border-border-soft px-6 py-12 text-center text-[13px] text-text-mute">
						No tags match “{search}”.
					</div>
				{/if}
				{#each displayed as t (t.id)}
					<div
						class="group flex items-center gap-3.5 border-t border-border-soft px-6 py-3"
						class:bg-bg-warm={editingId === t.id}
					>
						<TagIconChip color={t.color} icon={t.icon} size={38} />
						<button type="button" onclick={() => startEdit(t)} class="flex-1 border-none bg-transparent text-left">
							<div class="text-[14.5px] font-semibold text-foreground">{t.name}</div>
							<Caption>{t.count} payment{t.count === 1 ? '' : 's'}</Caption>
						</button>
						{#if t.budget != null}
							<span class="font-mono text-[12.5px] text-text-mute">{formatMoney(t.budget)}/mo</span>
						{/if}
						<button
							type="button"
							onclick={() => startEdit(t)}
							class="border-none bg-transparent p-1.5 text-text-mute hover:text-foreground"
							class:text-foreground={editingId === t.id}
							aria-label="Edit tag"
						>
							<PencilIcon size={16} />
						</button>
						<button
							type="button"
							onclick={() => remove(t.id)}
							class="border-none bg-transparent p-1.5 text-text-mute hover:text-[(--danger)]"
							aria-label="Delete tag"
						>
							<Trash2Icon size={16} />
						</button>
					</div>
				{/each}
			</div>
		</Card>
	</div>
</div>
