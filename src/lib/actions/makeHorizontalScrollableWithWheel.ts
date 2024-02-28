export function makeHorizontalScrollableWithWheel(node: HTMLElement) {
	node.addEventListener("wheel", e => {
		e.preventDefault()
		node.scrollLeft += e.deltaY
	})
}
