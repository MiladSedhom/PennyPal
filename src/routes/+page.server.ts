export const actions = {
	changeTheme: async ({ request, cookies }) => {
		const formData = await request.formData()
		const theme = String(formData.get('theme'))
		const color = String(formData.get('color'))

		if (theme) cookies.set('theme', theme, { path: '/' })
		if (color) cookies.set('color', color, { path: '/' })
	}
}
