import type { Handle } from '@sveltejs/kit'
import * as auth from '$lib/server/auth'
import { catchUpRecurringPayments } from '$lib/server/recurring'

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName)

	if (!sessionToken) {
		event.locals.user = null
		event.locals.session = null
		return resolve(event)
	}

	const { session, user } = await auth.validateSessionToken(sessionToken)

	if (session) {
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt)
	} else {
		auth.deleteSessionTokenCookie(event)
	}

	if (user) {
		try {
			await catchUpRecurringPayments(user.id)
		} catch (e) {
			console.error('recurring catch-up failed', e)
		}
	}

	event.locals.user = user
	event.locals.session = session
	return resolve(event)
}

export const handle: Handle = handleAuth
