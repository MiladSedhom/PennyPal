<script lang="ts">
	import { getTags, createOrUpdateTag, deleteTag } from '$lib/remote/tags.remote'
	import { getPayments } from '$lib/remote/payments.remote'

	import Card from '$lib/components/pp/card.svelte'
	import Caption from '$lib/components/pp/caption.svelte'
	import TagIconChip from '$lib/components/pp/tag-icon-chip.svelte'
	import { Button } from '$lib/components/ui/button'
	import { dialogs } from '$lib/components/pp/confirm-dialog'
	import { TAG_PALETTE, TAG_COLOR_LIST, ICON_CHOICES, ICON_LIBRARY, getSwatch, getIcon } from '$lib/tag-meta'
	import { formatMoney } from '$lib/utils'

	import CheckIcon from '@lucide/svelte/icons/check'
	import PlusIcon from '@lucide/svelte/icons/plus'
	import PencilIcon from '@lucide/svelte/icons/pencil'
	import Trash2Icon from '@lucide/svelte/icons/trash-2'
	import SearchIcon from '@lucide/svelte/icons/search'
	import XIcon from '@lucide/svelte/icons/x'
	import { toTitleCase } from '$lib/utils/index'

	const tags = $derived(await getTags())
	const payments = $derived(await getPayments())

	const fields = createOrUpdateTag.fields

	const sw = $derived(getSwatch(fields.color.value() ?? ''))
	const PreviewIcon = $derived(getIcon(fields.icon.value() ?? ''))

	let search = $state('')
	let sort = $state<'name' | 'count' | 'budget'>('name')

	const tagsWithPaymentCount = $derived(
		tags.map((t) => ({
			...t,
			count: payments.filter((p) => p.tags.some((tt) => tt.id === t.id)).length
		}))
	)

	const displayedTags = $derived.by(() => {
		let rows = tagsWithPaymentCount.slice()
		if (search.trim().toLowerCase())
			rows = rows.filter((t) => t.name.toLowerCase().includes(search.trim().toLowerCase()))
		return rows.toSorted((a, b) => {
			if (sort === 'count') return b.count - a.count || a.name.localeCompare(b.name)
			if (sort === 'budget') return (b.budget ?? -1) - (a.budget ?? -1) || a.name.localeCompare(b.name)
			return a.name.localeCompare(b.name)
		})
	})

	function resetForm() {
		fields.id.set(undefined)
		fields.color.set('sage')
		fields.icon.set('Tag')
		fields.name.set('')
		fields.budget.set('')
	}

	function startEdit(t: (typeof tagsWithPaymentCount)[number]) {
		fields.id.set(t.id.toString())
		fields.color.set(t.color in TAG_PALETTE ? t.color : 'sage')
		fields.icon.set((ICON_CHOICES as readonly string[]).includes(t.icon) ? t.icon : 'Tag')
		fields.name.set(t.name)
		fields.budget.set(t.budget == null ? '' : String(t.budget))
	}

	async function remove(id: number) {
		await deleteTag(id)
		if (fields.id.value() === id.toString()) resetForm()
	}

	function confirmRemove(t: (typeof tagsWithPaymentCount)[number]) {
		dialogs.danger(() => remove(t.id), {
			title: `Delete “${t.name}”?`,
			message: `This can't be undone.${t.count > 0 ? ` It will be removed from ${t.count} payment${t.count === 1 ? '' : 's'}.` : ''}`,
			confirmText: 'Delete tag'
		})
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
		<Card pad="xl" class="lg:sticky lg:top-4">
			<form
				{...createOrUpdateTag.enhance(async ({ submit }) => {
					if (await submit()) {
						if (createOrUpdateTag.result?.ok) resetForm()
					}
				})}
			>
				<input type="hidden" name="id" value={fields.id.value() ?? ''} />
				<input type="hidden" name="color" value={fields.color.value() ?? 'sage'} />
				<input type="hidden" name="icon" value={fields.icon.value() ?? 'Tag'} />

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
						<Caption>{fields.id.value() ? 'Editing' : 'New tag'}</Caption>
						<div class="mt-0.5 font-display text-[24px] font-bold tracking-[-0.03em]">
							{fields.name.value() || 'Untitled'}
						</div>
					</div>
					<span
						class="inline-flex items-center gap-1.5 rounded-full px-3 py-[5px] text-[12.5px] font-semibold"
						style:background={sw.bg}
						style:color={sw.ink}
					>
						<PreviewIcon size={13} />
						{fields.name.value() || 'Tag'}
					</span>
				</div>

				<!-- Name + budget -->
				<div class="mb-[22px] grid gap-3 sm:grid-cols-[1.5fr_1fr]">
					<label class="block">
						<Caption class="mb-2 block">Name</Caption>
						<input
							{...fields.name.as('text')}
							placeholder="e.g. Groceries"
							class="w-full rounded-sm border border-border bg-bg-warm px-[14px] py-[11px] text-[14px] font-medium text-foreground outline-none focus:border-primary"
						/>
					</label>
					<label class="block">
						<Caption class="mb-2 block">Monthly budget</Caption>
						<div class="relative flex items-center">
							<span class="absolute left-[14px] font-mono text-[14px] text-text-mute">$</span>
							<input
								{...fields.budget.as('text')}
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
								onclick={() => fields.color.set(id)}
								class="inline-flex h-[38px] w-[38px] items-center justify-center rounded-[11px]"
								style:background={s.bg}
								style:border={fields.color.value() === id ? `2px solid var(--text)` : '2px solid transparent'}
								aria-label={id}
							>
								{#if fields.color.value() === id}
									<span class="h-3.5 w-3.5 rounded-full" style:background={s.ink}></span>
								{/if}
							</button>
						{/each}
					</div>
				</div>

				<!-- Icon -->
				<div class="mb-[26px]">
					<Caption class="mb-2.5 block">Icon</Caption>
					<div class="flex flex-wrap gap-2">
						{#each ICON_CHOICES as icon (icon)}
							{@const IconComponent = ICON_LIBRARY[icon]}
							{@const selected = fields.icon.value() === icon}
							<button
								type="button"
								onclick={() => fields.icon.set(icon)}
								class="inline-flex aspect-square items-center justify-center rounded-[8px] size-12"
								style:background={selected ? sw.bg : 'var(--bg-warm)'}
								style:color={selected ? sw.ink : 'var(--text-dim)'}
								style:border={selected ? `1px solid ${sw.ink}` : '1px solid transparent'}
								aria-label={icon}
								title={toTitleCase(icon)}
							>
								<IconComponent size={15} />
							</button>
						{/each}
					</div>
				</div>

				{#if createOrUpdateTag.fields.allIssues()?.[0]}
					<div
						class="mb-4 rounded-sm border border-destructive/30 bg-destructive/10 px-3 py-2 text-[12.5px] font-medium text-destructive"
					>
						{createOrUpdateTag.fields.allIssues()?.[0].message}
					</div>
				{/if}

				<div class="flex gap-2.5">
					<Button
						type="submit"
						disabled={!fields.name.value()?.trim() || createOrUpdateTag.pending > 0}
						class="h-[40px] flex-1 gap-2 rounded-full bg-foreground px-[18px] text-[13.5px] font-semibold text-background hover:bg-foreground/90"
					>
						<CheckIcon size={15} />
						{fields.id.value() ? 'Save changes' : 'Create tag'}
					</Button>
					{#if fields.id.value()}
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
							onclick={() => {
								const t = tagsWithPaymentCount.find((x) => x.id.toString() === fields.id.value())
								if (t) confirmRemove(t)
							}}
							class="h-[40px] gap-2 rounded-full bg-transparent px-[18px] text-[13.5px] font-semibold text-(--danger) hover:bg-(--danger)/10"
							aria-label="Delete this tag"
						>
							<Trash2Icon size={15} />
						</Button>
					{/if}
				</div>
			</form>
		</Card>

		<!-- Existing tags list -->
		<Card pad="none">
			<div class="flex items-center justify-between px-6 pb-4 pt-5">
				<span class="font-display text-[19px] font-semibold tracking-[-0.02em]">
					Your tags <span class="font-medium text-text-mute">· {tagsWithPaymentCount.length}</span>
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
					{#each [['name', 'Name'], ['count', 'Usage'], ['budget', 'Budget']] as const as [key, label] (key)}
						<button
							type="button"
							onclick={() => (sort = key)}
							class="rounded-full border-none px-[14px] py-1.5 text-[12.5px] font-semibold"
							class:bg-card={sort === key}
							class:text-foreground={sort === key}
							class:shadow-xs={sort === key}
							class:bg-transparent={sort !== key}
							class:text-text-mute={sort !== key}
						>
							{label}
						</button>
					{/each}
				</div>
			</div>

			<div class="max-h-[calc(100vh-280px)] overflow-y-auto">
				{#if tagsWithPaymentCount.length === 0}
					<div class="border-t border-border-soft px-6 py-12 text-center text-[13px] text-text-mute">
						You don't have any tags yet — create your first on the left.
					</div>
				{:else if displayedTags.length === 0}
					<div class="border-t border-border-soft px-6 py-12 text-center text-[13px] text-text-mute">
						No tags match “{search}”.
					</div>
				{/if}
				{#each displayedTags as t (t.id)}
					<div
						class="group flex items-center gap-3.5 border-t border-border-soft px-6 py-3"
						class:bg-bg-warm={fields.id.value() === t.id.toString()}
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
							class:text-foreground={fields.id.value() === t.id.toString()}
							aria-label="Edit tag"
						>
							<PencilIcon size={16} />
						</button>
						<button
							type="button"
							onclick={() => confirmRemove(t)}
							class="border-none bg-transparent p-1.5 text-text-mute hover:text-(--danger)"
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
