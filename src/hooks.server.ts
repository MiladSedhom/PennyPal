import { redirect } from '@sveltejs/kit'
import { sequence, type Handle } from '@sveltejs/kit/hooks'
import * as auth from '#lib/server/auth.js'
import { catchUpRecurringPayments } from '#lib/server/recurring.js'

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

// Every page outside the (auth) group needs a session; remote functions gate themselves via getLoggedInUser.
const requireLogin: Handle = ({ event, resolve }) => {
	const routeId = event.route.id
	if (!event.locals.user && routeId && !routeId.startsWith('/(auth)')) redirect(302, '/login')
	return resolve(event)
}

export const handle = sequence(handleAuth, requireLogin)
