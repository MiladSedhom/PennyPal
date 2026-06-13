export function focusAdjacentTabbable(from: HTMLElement | null, dir: 1 | -1) {
	if (!from) return
	const tabbables = Array.from(
		document.querySelectorAll<HTMLElement>(
			'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
		)
	).filter((el) => el === from || el.offsetParent !== null)
	tabbables[tabbables.indexOf(from) + dir]?.focus()
}
