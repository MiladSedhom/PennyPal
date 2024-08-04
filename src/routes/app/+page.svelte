<script lang="ts">
	import PaymentCard from './(components)/PaymentCard.svelte'
	import Infobar from './(components)/Infobar.svelte'
	import Masonry from 'masonry-layout'
	import { onMount, afterUpdate } from 'svelte'

	export let data

	let selectedPayments = new Set<number>()

	const handleClick = (id: number) => {
		if (selectedPayments.has(id)) selectedPayments.delete(id)
		else selectedPayments.add(id)
		selectedPayments = selectedPayments
	}

	let masonry: any

	onMount(() => {
		masonry = new Masonry('.masonry', {
			itemSelector: '.masonry-item',
			columnWidth: '.masonry-item',
			gutter: 16,
			horizontalOrder: true,
			fitWidth: true
		})

		return () => {
			masonry.destroy()
		}
	})

	afterUpdate(() => {
		masonry.reloadItems()
		masonry.layout()
	})
</script>

<div class=" size-full p-6">
	<div class="masonry m-x-auto p-b-10">
		{#if data.payments?.length}
			{#each data.payments as payment (payment.id)}
				<div class="masonry-item m-b-4 max-w-80">
					<PaymentCard
						{payment}
						selected={selectedPayments.has(payment.id)}
						on:click={() => {
							handleClick(payment.id)
						}}
						on:keydown={(event) => {
							if (event.code === 'Enter' || event.code === 'Space') handleClick(payment.id)
						}}
					/>
				</div>
			{/each}
		{/if}
	</div>
</div>
<div class="pos-fixed bottom-0 w-full">
	{#if data.payments?.length}
		<Infobar
			payments={selectedPayments.size === 0 ? data.payments : data.payments.filter((p) => selectedPayments.has(p.id))}
		/>
	{/if}
</div>
