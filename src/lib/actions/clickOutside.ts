export function clickOutside(node: Node) {
	const handleClick = (event: Event) => {
		// @ts-ignore
		if (node && !node.contains(event.target)) {
			node.dispatchEvent(new CustomEvent("clickoutside"))
		}
	}

	document.addEventListener("click", handleClick, true)

	return {
		destroy() {
			document.removeEventListener("click", handleClick, true)
		},
	}
}
