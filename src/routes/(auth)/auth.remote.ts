import { form, getRequestEvent, query } from '$app/server'
import { hash, verify } from '@node-rs/argon2'
import { fail, redirect } from '@sveltejs/kit'
import * as auth from '$lib/server/auth'
import { user } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import { db } from '$lib/server/db'
import { credentialsSchema } from '$lib/schemas/credentials'

export const getLoggedInUser = query(async () => {
	const { locals, url } = getRequestEvent()

	if (!locals.user && url.pathname !== '/login' && url.pathname !== '/register') {
		console.log('No logged in user, redirecting to /login')
		return redirect(302, '/login')
	}

	return locals.user
})

export const login = form(credentialsSchema, async ({ username, password }) => {
	const results = await db.select().from(user).where(eq(user.username, username))

	const existingUser = results.at(0)
	if (!existingUser) return fail(400, { message: 'Incorrect username or password' })

	const validPassword = await verify(existingUser!.passwordHash!, password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	})
	if (!validPassword) return fail(400, { message: 'Incorrect username or password' })

	const sessionToken = auth.generateSessionToken()
	const session = await auth.createSession(sessionToken, existingUser.id)

	const event = getRequestEvent()
	auth.setSessionTokenCookie(event, sessionToken, session.expiresAt)

	return redirect(302, '/')
})

export const register = form(credentialsSchema, async ({ username, password }) => {
	const userId = crypto.randomUUID()
	const passwordHash = await hash(password, {
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	})

	try {
		console.log('Inserting user:', { userId, username, passwordHash })
		await db.insert(user).values({ id: userId, username, passwordHash })

		console.log(':', { userId, username, passwordHash })
		const sessionToken = auth.generateSessionToken()
		const session = await auth.createSession(sessionToken, userId)

		const event = getRequestEvent()
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt)
	} catch (error) {
		console.error('Error inserting user:', error)
		return fail(500, { message: 'An error has occurred' })
	}

	return redirect(302, '/')
})

export const logout = form('unchecked', async () => {
	const event = getRequestEvent()

	if (event.locals.session) {
		await auth.invalidateSession(event.locals.session.id)
		auth.deleteSessionTokenCookie(event)
		event.locals.user = null
	}

	return redirect(302, '/login')
})
