<script lang="ts">
	import { getTags, createTag } from '$lib/remote/tags.remote'
	import { getPayments } from '$lib/remote/payments.remote'

	import Card from '$lib/components/pp/card.svelte'
	import Caption from '$lib/components/pp/caption.svelte'
	import TagIconChip from '$lib/components/pp/tag-icon-chip.svelte'
	import { Button } from '$lib/components/ui/button'
	import { TAG_PALETTE, TAG_COLOR_LIST, ICON_CHOICES, ICON_LIBRARY, type TagColor } from '$lib/tag-meta'

	import CheckIcon from '@lucide/svelte/icons/check'
	import PlusIcon from '@lucide/svelte/icons/plus'
	import MoreHorizontalIcon from '@lucide/svelte/icons/more-horizontal'

	const tags = $derived(await getTags())
	const payments = $derived(await getPayments())

	let name = $state('Travel')
	let swatch = $state<TagColor>('sky')
	let icon = $state<(typeof ICON_CHOICES)[number]>('Plane')
	let budget = $state('300')

	const sw = $derived(TAG_PALETTE[swatch])
	const PreviewIcon = $derived(ICON_LIBRARY[icon])

	const existing = $derived(
		tags.map((t) => ({
			...t,
			count: payments.filter((p) => p.tags.some((tt) => tt.id === t.id)).length
		}))
	)
</script>

<div class="px-10 pb-14 pt-2">
	<div class="mb-6">
		<h1 class="m-0 font-display text-[38px] font-bold tracking-[-0.04em] text-foreground">Tags</h1>
		<p class="mt-2 m-0 text-[15.5px] text-text-dim">
			Give every tag a color and an icon. They show up across your payments and budgets.
		</p>
	</div>

	<div class="grid items-start gap-4 lg:grid-cols-[1fr_1.15fr]">
		<!-- Create / edit form -->
		<Card pad="xl">
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
					<Caption>Preview</Caption>
					<div class="mt-0.5 font-display text-[24px] font-bold tracking-[-0.03em]">{name || 'Untitled'}</div>
				</div>
				<span
					class="inline-flex items-center gap-1.5 rounded-full px-3 py-[5px] text-[12.5px] font-semibold"
					style:background={sw.bg}
					style:color={sw.ink}
				>
					<PreviewIcon size={13} />
					{name || 'Tag'}
				</span>
			</div>

			<!-- Name + budget -->
			<form
				{...createTag}
				class="contents"
				onsubmit={() => {
					// allow native submit; clear local name once posted
					setTimeout(() => {
						name = ''
					}, 0)
				}}
			>
				<div class="mb-[22px] grid gap-3 sm:grid-cols-[1.5fr_1fr]">
					<label class="block">
						<Caption class="mb-2 block">Name</Caption>
						<input
							{...createTag.fields.name.as('text')}
							bind:value={name}
							placeholder="e.g. Travel"
							class="w-full rounded-[10px] border border-border bg-bg-warm px-[14px] py-[11px] text-[14px] font-medium text-foreground outline-none"
						/>
					</label>
					<label class="block">
						<Caption class="mb-2 block">Monthly budget</Caption>
						<div class="relative flex items-center">
							<span class="absolute left-[14px] font-mono text-[14px] text-text-mute">$</span>
							<input
								bind:value={budget}
								placeholder="0"
								class="w-full rounded-[10px] border border-border bg-bg-warm py-[11px] pl-[26px] pr-[14px] font-mono text-[14px] font-medium text-foreground outline-none"
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
								onclick={() => (swatch = id)}
								class="inline-flex h-[38px] w-[38px] items-center justify-center rounded-[11px]"
								style:background={s.bg}
								style:border={swatch === id ? `2px solid var(--text)` : '2px solid transparent'}
								aria-label={id}
							>
								{#if swatch === id}
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
							{@const on = icon === ic}
							<button
								type="button"
								onclick={() => (icon = ic)}
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
						type="submit"
						class="h-[40px] flex-1 gap-2 rounded-full bg-foreground px-[18px] text-[13.5px] font-semibold text-background hover:bg-foreground/90"
					>
						<CheckIcon size={15} /> Save tag
					</Button>
					<Button
						type="button"
						variant="outline"
						class="h-[40px] gap-2 rounded-full bg-transparent px-[18px] text-[13.5px] font-semibold"
					>
						Cancel
					</Button>
				</div>
			</form>
		</Card>

		<!-- Existing tags list -->
		<Card pad="none">
			<div class="flex items-center justify-between px-6 pb-4 pt-5">
				<span class="font-display text-[19px] font-semibold tracking-[-0.02em]">
					Your tags <span class="font-medium text-text-mute">· {existing.length}</span>
				</span>
				<Button
					type="button"
					class="h-[32px] gap-1.5 rounded-full bg-mint px-3 text-[12.5px] font-semibold text-foreground hover:bg-mint-deep"
				>
					<PlusIcon size={13} /> New
				</Button>
			</div>
			{#if existing.length === 0}
				<div class="border-t border-border-soft px-6 py-12 text-center text-[13px] text-text-mute">
					You don't have any tags yet — create your first on the left.
				</div>
			{/if}
			{#each existing as t (t.id)}
				<div class="flex items-center gap-3.5 border-t border-border-soft px-6 py-3">
					<TagIconChip name={t.name} size={38} />
					<div class="flex-1">
						<div class="text-[14.5px] font-semibold">{t.name}</div>
						<Caption>{t.count} payment{t.count === 1 ? '' : 's'} this month</Caption>
					</div>
					<button type="button" class="border-none bg-transparent p-1.5 text-text-mute" aria-label="More">
						<MoreHorizontalIcon size={16} />
					</button>
				</div>
			{/each}
		</Card>
	</div>
</div>
