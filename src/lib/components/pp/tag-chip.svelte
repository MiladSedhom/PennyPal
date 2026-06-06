<script lang="ts">
	import { getSwatch, getIcon } from '$lib/tag-meta'

	type Props = { name: string; color: string; icon: string; size?: 'sm' | 'md' }
	const { name, color, icon, size = 'md' }: Props = $props()

	const c = $derived(getSwatch(color))
	const Icon = $derived(getIcon(icon))
	const sm = $derived(size === 'sm')
</script>

<span
	class="inline-flex items-center whitespace-nowrap rounded-full font-semibold leading-none
    {sm ? 'gap-[5px] py-[7px] pr-[9px] pl-[7px] text-[11.5px]' : 'gap-1.5 py-[4px] pr-[11px] pl-2 text-[12.5px]'}"
	style:background={c.bg}
	style:color={c.ink}
>
	<Icon size={sm ? 11 : 13} strokeWidth={1.85} />
	{name}
</span>
