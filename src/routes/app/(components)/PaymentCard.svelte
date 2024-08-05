<script lang="ts">
	import { enhance } from '$app/forms'
	import type { Payment } from '@prisma/client'
	import { fade } from 'svelte/transition'
	import Modal from '$lib/components/Modal.svelte'
	import PaymentForm from './PaymentForm.svelte'

	export let payment: Payment & { tags: string[] }
	export let selected: boolean = false

	let isEditForm = false
</script>

<div
	class="bg-primary text-text-alt border-rd-1 flex h-full w-80 flex-col gap-4 p-6
	{selected && 'outline-color-primary outline-solid outline-2'}"
	on:click
	on:keydown
	role="button"
	tabindex="0"
	transition:fade={{ duration: 200 }}
>
	<div class="flex basis-full items-start justify-between">
		<span class="text-10 fw-700 font-[var(--serif)]">{payment.amount}</span>

		<div class="p-t-2 flex flex-wrap justify-end gap-2">
			{#each payment.tags as tag}
				<span class="bg-text text-14px text-text-alt p-x-4 p-y-1 rounded-1 font-700"> {tag} </span>
			{/each}
		</div>
	</div>
	{#if payment.note}
		<span class="text-3 fw-500 p-r-2 grow" title={payment.note}>{payment.note}</span>
	{/if}
	<div class="flex grow items-center justify-between">
		<div class="flex gap-1">
			<form action="?/removePayment" method="post" use:enhance class="flex items-center justify-center">
				<input type="hidden" name="id" value={payment.id} />
				<button
					class="rounded-1 hover:bg-text group inline-block size-8 active:scale-95"
					on:click|stopPropagation={() => {}}
				>
					<div class="i-tabler-trash text-5 transition-transform-300 group-hover:(scale-105 text-red-600)"></div>
				</button>
				<button
					class="rounded-1 hover:bg-text-alt group inline-grid size-8 place-content-center active:scale-95"
					on:click={() => (isEditForm = true)}
					type="button"
				>
					<div class="i-tabler-edit text-5 transition-transform-300 group-hover:(text-primary scale-105)"></div>
				</button>
			</form>
		</div>
		<span class="text-3 fw-600 self-end">{new Date(payment.createdAt).toLocaleDateString()}</span>
	</div>
</div>

<Modal
	showModal={isEditForm}
	onClose={() => {
		isEditForm = false
	}}
>
	<PaymentForm
		action="/app/payment/{payment.id}?/updatePayment"
		onSubmit={() => {
			isEditForm = false
		}}
		initialPaymentData={payment}
		submitButtonText="Update Payment"
	/>
</Modal>
