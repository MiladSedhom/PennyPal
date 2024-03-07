<script lang="ts">
	import PaymentCard from './(components)/PaymentCard.svelte'
	import Infobar from './(components)/Infobar.svelte'
	export let data

	let selectedPayments = new Set<number>()

	const handleOnClick = (id: number) => {
		if (selectedPayments.has(id)) selectedPayments.delete(id)
		else selectedPayments.add(id)
		selectedPayments = selectedPayments
	}
</script>

<div class="container">
	{#if data.payments?.length != 0}
		{#each data.payments as payment}
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
		{/each}
	{/if}
</div>
<div class="bot">
	<Infobar
		payments={selectedPayments.size === 0 ? data.payments : data.payments.filter((p) => selectedPayments.has(p.id))}
	/>
</div>

<style>
	.container {
		width: 100%;
		padding: var(--spacing-32);
		display: flex;
		flex-flow: column;
		gap: var(--spacing-16);
	}

	.bot {
		width: 100%;
		position: fixed;
		bottom: 0;
	}
</style>
