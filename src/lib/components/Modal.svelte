<script lang="ts">
	import { trapFocus } from '$lib/actions/focusTrap'
	import { portal } from '$lib/actions/portal'
	import { fade, scale } from 'svelte/transition'

	export let showModal: boolean = false
	export let onClose: (() => void) | undefined = undefined

	function closeModal() {
		showModal = false
		onClose?.()
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeModal()
		}
	}
</script>

{#if showModal}
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div
		use:portal
		use:trapFocus
		class="position-fixed backdrop-blur-2px left-0 top-0 z-40 size-full bg-black/30"
		on:click={closeModal}
		transition:fade={{ duration: 200 }}
	>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			class="min-w-120 max-w-80% max-h-80% position-fixed left-50% top-50% translate--50% z-40 overflow-y-auto"
			on:click|stopPropagation
			transition:scale={{ duration: 300, start: 0.95 }}
		>
			<slot />
		</div>
	</div>
{/if}

<svelte:window on:keydown={handleKeydown} />
