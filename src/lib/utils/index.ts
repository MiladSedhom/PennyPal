export function toTitleCase(input: string): string {
	if (!input) return ''

	// Detect whether the input contains camelCase / PascalCase transitions
	// (i.e. mixed-case letters without separators).  Only in that situation do
	// we treat all-caps tokens as acronyms worth preserving.
	const hasCamelOrPascal = /[a-z][A-Z]/.test(input) || /[A-Z]{2,}[a-z]/.test(input)

	// Step 1: Insert spaces at camelCase / PascalCase boundaries.
	const withSpaces = input
		// "HTTPSRequest" → "HTTPS Request"
		.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
		// "camelCase" → "camel Case"
		.replace(/([a-z\d])([A-Z])/g, '$1 $2')

	// Step 2: Split on any non-alphanumeric separator and drop empty tokens.
	const words = withSpaces.split(/[\s_\-\.]+/).filter((word) => word.length > 0)

	// Step 3: Title-case each word.
	//   • If the original string had camelCase/PascalCase AND this token is all
	//     uppercase with 2+ chars, treat it as an acronym and preserve it.
	//   • Otherwise, standard Title Case (first letter up, rest down).
	return words
		.map((word) => {
			if (hasCamelOrPascal && /^[A-Z]{2,}$/.test(word)) {
				return word // preserve embedded acronyms: HTTPS, API, URL …
			}
			return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
		})
		.join(' ')
}
