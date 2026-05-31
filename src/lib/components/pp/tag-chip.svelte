<script lang="ts">
	import { getTagMeta, TAG_PALETTE } from '$lib/tag-meta'

	type Props = { name: string; size?: 'sm' | 'md' }
	const { name, size = 'md' }: Props = $props()

	const meta = $derived(getTagMeta(name))
	const c = $derived(TAG_PALETTE[meta.color])
	const Icon = $derived(meta.icon)
	const sm = $derived(size === 'sm')
</script>

<span
	class="inline-flex items-center whitespace-nowrap rounded-full font-semibold leading-none"
	class:gap-[5px]={sm}
	class:gap-1.5={!sm}
	class:px-[9px]={sm}
	class:py-[3px]={sm}
	class:pl-[7px]={sm}
	class:px-[11px]={!sm}
	class:py-[4px]={!sm}
	class:pl-2={!sm}
	class:text-[11.5px]={sm}
	class:text-[12.5px]={!sm}
	style:background={c.bg}
	style:color={c.ink}
>
	<Icon size={sm ? 11 : 13} strokeWidth={1.85} />
	{name}
</span>
