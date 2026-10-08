import type { Tag } from '../payments-format'

type TagStat = Tag & { count: number; spend: number }

const PRIMARY_TAG_COUNT = 6

/**
 * Splits tags into the ones worth showing up front (top by usage, top by spend, plus anything
 * selected) and the rest, sorted by name.
 */
export function rankTags(stats: TagStat[], allTags: Tag[], selectedIds: number[]) {
	const topByCount = stats.toSorted((a, b) => b.count - a.count).slice(0, PRIMARY_TAG_COUNT)
	const topBySpend = stats.toSorted((a, b) => b.spend - a.spend).slice(0, PRIMARY_TAG_COUNT)
	const primaryIds = new Set([...topByCount, ...topBySpend].map((s) => s.id).concat(selectedIds))

	const statById = new Map(stats.map((s) => [s.id, s]))
	const statOf = (id: number) => statById.get(id) ?? { count: 0, spend: 0 }

	const primary = allTags
		.filter((t) => primaryIds.has(t.id))
		.sort((a, b) => {
			const sa = statOf(a.id)
			const sb = statOf(b.id)
			return sb.count - sa.count || sb.spend - sa.spend || a.name.localeCompare(b.name)
		})
	const overflow = allTags.filter((t) => !primaryIds.has(t.id)).sort((a, b) => a.name.localeCompare(b.name))

	return { primary, overflow }
}

export function matchTagsByName(tags: Tag[], search: string): Tag[] {
	const query = search.trim().toLowerCase()
	return query ? tags.filter((t) => t.name.toLowerCase().includes(query)) : tags
}
