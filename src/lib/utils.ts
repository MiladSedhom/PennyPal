export function getLastWeeksDate() {
	const now = new Date()
	return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
}
export function getFirstDayOfTheMonth() {
	const now = new Date()
	return new Date(now.getFullYear(), now.getMonth(), 1)
}
