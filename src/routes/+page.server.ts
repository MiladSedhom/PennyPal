import { colors } from '$lib/theme.js'

export const actions = {
	changeTheme: async ({ locals, cookies }) => {
		const nextTheme = locals.theme === 'dark' ? 'light' : 'dark'
		cookies.set('theme', nextTheme, { path: '/' })
	},
	changeColor: async ({ locals, cookies }) => {
		let nextColor = colors[(colors.indexOf(locals.color) + 1) % colors.length]
		cookies.set('color', nextColor, { path: '/' })
	}
}
