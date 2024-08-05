<script lang="ts">
	import { fade, scale } from 'svelte/transition'
	import { createEventDispatcher } from 'svelte'

	export let showModal: boolean = false

	const dispatch = createEventDispatcher()

	function closeModal() {
		showModal = false
		dispatch('close')
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeModal()
		}
	}
</script>

{#if showModal}
	<div class="modal-backdrop" on:click={closeModal} transition:fade={{ duration: 200 }}>
		<div class="modal-content" on:click|stopPropagation transition:scale={{ duration: 300, start: 0.95 }}>
			<div class="modal-body">
				<slot />
			</div>
		</div>
	</div>
{/if}

<svelte:window on:keydown={handleKeydown} />

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.3);
		backdrop-filter: blur(2px);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 40;
	}

	.modal-content {
		width: 28rem;
		max-width: 90%;
		max-height: 90%;
		overflow-y: auto;
	}
</style>
