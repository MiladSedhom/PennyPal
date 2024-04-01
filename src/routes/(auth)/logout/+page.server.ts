import { redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { lucia } from '$lib/server/auth'

export const load: PageServerLoad = async ({ cookies, locals }) => {
	// we only use this endpoint for the api
	// and don't need to see the page
	if (locals.session) await lucia.invalidateSession(locals.session.id)
	const blankCookies = lucia.createBlankSessionCookie()

	// eat the cookie
	cookies.set(blankCookies.name, blankCookies.value, {
		path: '/',
		...blankCookies.attributes
	})

	// redirect the user
	redirect(302, '/login')
	redirect(302, '/')
}

export const actions: Actions = {
	default: async ({ cookies, locals }) => {
		if (locals.session) await lucia.invalidateSession(locals.session.id)
		const blankCookies = lucia.createBlankSessionCookie()

		// eat the cookie
		cookies.set(blankCookies.name, blankCookies.value, {
			path: '/',
			...blankCookies.attributes
		})

		// redirect the user
		redirect(302, '/')
	}
}
