export const actions = {
	changeTheme: async ({ locals, cookies }) => {
		const nextTheme = locals.theme === 'dark' ? 'light' : 'dark'
		cookies.set('theme', nextTheme, { path: '/' })
	},
	changeColor: async ({ locals, cookies }) => {
		const colors = ['green', 'pink', 'yellow', 'blue']
		let nextColor = colors[(colors.indexOf(locals.color) + 1) % colors.length]
		cookies.set('color', nextColor, { path: '/' })
	}
}
