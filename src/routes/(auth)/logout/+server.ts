import { redirect } from '@sveltejs/kit'
import { lucia } from '$lib/server/auth'

export const GET = async ({ cookies, locals }) => {
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
