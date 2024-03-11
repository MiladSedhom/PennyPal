export function scrollAction(node: HTMLElement, args: { isScroll: boolean }) {
	// the node has been mounted in the DOM

	return {
		// @ts-ignore
		update(args) {
			args.isScroll && node.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
		},

		destroy() {
			// the node has been removed from the DOM
		}
	}
}
