export function portal(node: HTMLElement, { target } = { target: document.body }) {
	target.appendChild(node)

	return {
		destroy() {
			node.remove()
		}
	}
}
