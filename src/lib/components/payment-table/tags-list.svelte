<script lang="ts">
	const { tags }: { tags: { id: number; name: string }[] } = $props()
</script>

<ul class="flex flex-wrap gap-2">
	{#each tags as tag}
		<li class="bg-foreground text-background text-sm font-medium px-1.5 py-1 rounded-full">
			<span class="inline-block w-3 h-3 leading-1 rounded-full bg-blue-600"></span>
			<span class="inline-flex items-center">
				{tag.name}
			</span>
		</li>
	{/each}
</ul>
