<script lang="ts">
	import * as ToggleGroup from '#lib/components/ui/toggle-group/index.js'
	import SearchIcon from '@lucide/svelte/icons/search'
	import type { PaymentFilters } from '../filters.svelte'
	import type { Tag } from '../payments-format'
	import { matchTagsByName } from './tag-ranking'
	import TagToggle from './tag-toggle.svelte'

	let { filters, tags }: { filters: PaymentFilters; tags: Tag[] } = $props()

	let search = $state('')
	const visibleTags = $derived(matchTagsByName(tags, search))
</script>

<div class="mb-2.5 flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
	<SearchIcon size={13} class="text-faint" />
	<input
		bind:value={search}
		aria-label="Search tags"
		placeholder="Search tags…"
		class="flex-1 border-none bg-transparent text-[13px] text-foreground outline-none placeholder:text-faint"
	/>
</div>

<ToggleGroup.Root
	type="multiple"
	aria-label="Tags"
	bind:value={() => filters.tagIds.map(String), (ids) => (filters.tagIds = ids.map(Number))}
>
	{#each visibleTags as tag (tag.id)}
		<TagToggle {tag} />
	{:else}
		<p class="w-full py-3 text-center text-[12.5px] text-faint">No tags match.</p>
	{/each}
</ToggleGroup.Root>
