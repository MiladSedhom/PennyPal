<script lang="ts">
	import { enhance } from '$app/forms'
	import type { Payment } from '@prisma/client'
	import { goto } from '$app/navigation'
	import { fade } from 'svelte/transition'

	export let payment: Payment & { tags: string[] }
	export let selected: boolean = false
</script>

<div
	class="bg-bg border-rd-1 flex min-w-80 flex-col gap-4 p-8
	{selected && 'outline-color-primary outline-solid outline-2'}"
	on:click
	on:dblclick={() => {
		goto(`/app/payment/${payment.id}`)
	}}
	on:keydown
	role="button"
	tabindex="0"
	transition:fade={{ duration: 200 }}
>
	<div class="flex basis-full justify-between">
		<span class="text-6 fw-500">{payment.amount}</span>

		<div class="flex gap-1">
			<form action="?/removePayment" method="post" use:enhance>
				<input type="hidden" name="id" value={payment.id} />
				<button
					class="i-tabler-trash text-5 transition-transform-300 hover:scale-110 hover:text-red-600"
					on:click|stopPropagation={() => {}}
				>
				</button>
				<a
					class="i-tabler-edit text-5 transition-transform-300 hover:text-primary hover:scale-110"
					href={`/app/payment/${payment.id}`}
				>
				</a>
			</form>
		</div>
	</div>
	<div class="h-4"></div>
	<div class="flex grow items-center justify-between">
		<div class="flex flex-wrap gap-1">
			{#each payment.tags as tag}
				<span class="bg-primary text-12px text-text-alt p-x-4 p-y-1 border-rd-1"> {tag} </span>
			{/each}
		</div>
		<span class="text-3">{new Date(payment.createdAt).toLocaleDateString()}</span>
	</div>
	{#if payment.note}
		<span class="text-3 fw-400 grow" title={payment.note}>{payment.note ? payment.note : ''}</span>
	{/if}
</div>
