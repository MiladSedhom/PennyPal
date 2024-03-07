export function focusOutside(node: Node) {
	const handleClick = (event: Event) => {
		//@ts-ignore
		if (node && !node.contains(event.relatedTarget)) {
			node.dispatchEvent(new CustomEvent("focusoutside"))
		}
	}

	document.addEventListener("blur", handleClick, true)

	return {
		destroy() {
			document.removeEventListener("blur", handleClick, true)
		},
	}
}
