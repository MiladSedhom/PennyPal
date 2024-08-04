<script lang="ts">
	import PaymentCard from './(components)/PaymentCard.svelte'
	import Infobar from './(components)/Infobar.svelte'
	import { flip } from 'svelte/animate'
	import { quintOut } from 'svelte/easing'
	export let data

	let selectedPayments = new Set<number>()

	const handleOnClick = (id: number) => {
		if (selectedPayments.has(id)) selectedPayments.delete(id)
		else selectedPayments.add(id)
		selectedPayments = selectedPayments
	}
</script>

<div
	class="m-b-8 grid min-h-full w-full grid-cols-[repeat(auto-fill,320px)] grid-rows-[repeat(auto-fill,minmax(16px,auto))] place-content-center gap-4 p-8"
>
	{#if data.payments?.length}
		{#each data.payments as payment (payment.id)}
			<div animate:flip={{ duration: 500, easing: quintOut }}>
				<PaymentCard
					{payment}
					selected={selectedPayments.has(payment.id)}
					on:click={() => {
						handleOnClick(payment.id)
					}}
					on:keydown={(event) => {
						if (event.code === 'Enter' || event.code === 'Space') handleOnClick(payment.id)
					}}
				/>
			</div>
		{/each}
	{/if}
</div>
<div class="pos-fixed bottom-0 w-full">
	{#if data.payments?.length}
		<Infobar
			payments={selectedPayments.size === 0 ? data.payments : data.payments.filter((p) => selectedPayments.has(p.id))}
		/>
	{/if}
</div>
