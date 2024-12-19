<script lang="ts">
	import { createBubbler, stopPropagation } from 'svelte/legacy';

	const bubble = createBubbler();
	import { trapFocus } from '$lib/actions/focusTrap'
	import { portal } from '$lib/actions/portal'
	import { fade, scale } from 'svelte/transition'

	interface Props {
		showModal?: boolean;
		onClose?: (() => void) | undefined;
		children?: import('svelte').Snippet;
	}

	let { showModal = $bindable(false), onClose = undefined, children }: Props = $props();

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
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		use:portal
		use:trapFocus
		class="position-fixed backdrop-blur-2px left-0 top-0 z-40 size-full bg-black/30"
		onclick={closeModal}
		transition:fade={{ duration: 200 }}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="sm:min-w-110 max-w-90% max-h-80% position-fixed left-50% top-50% translate--50% min-w-90 z-40 overflow-y-auto"
			onclick={stopPropagation(bubble('click'))}
			transition:scale={{ duration: 300, start: 0.95 }}
		>
			{@render children?.()}
		</div>
	</div>
{/if}

<svelte:window onkeydown={handleKeydown} />
