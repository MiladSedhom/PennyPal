import { command, form, getRequestEvent, query } from '$app/server'
import { hash, verify } from '@node-rs/argon2'
import { invalid, redirect } from '@sveltejs/kit'
import * as v from 'valibot'
import * as auth from '$lib/server/auth'
import { oauthAccount, user } from '$lib/server/db/schema'
import { and, eq } from 'drizzle-orm'
import { db } from '$lib/server/db'
import { chooseUsernameSchema, loginOrRegisterSchema } from '$lib/schemas'
import { clearPendingSignup, readPendingSignup } from '$lib/server/oauth'
import { createOAuthAccount, getOAuthAccountsByUser } from '$lib/server/db/modules/oauth-accounts'

export const getLoggedInUser = query(async () => {
	const { locals, url } = getRequestEvent()

	// Allow the whole /login/* subtree (sign-in, OAuth, the post-OAuth username step).
	if (!locals.user && !url.pathname.startsWith('/login') && url.pathname !== '/register') {
		throw redirect(302, '/login')
	}

	return locals.user!
})

const ARGON_OPTS = { memoryCost: 19456, timeCost: 2, outputLen: 32, parallelism: 1 }

// Login/registration is by username + password. (Email lives only on OAuth-created
// accounts and is never collected here.)
export const loginOrRegister = form(loginOrRegisterSchema, async ({ username, password, action }, issue) => {
	if (action === 'login') {
		const [existingUser] = await db.select().from(user).where(eq(user.username, username))
		// Same generic message whether the username is unknown or the password is wrong.
		if (!existingUser?.passwordHash) invalid(issue.username('Incorrect username or password.'))
		if (!(await verify(existingUser.passwordHash, password, ARGON_OPTS))) {
			invalid(issue.username('Incorrect username or password.'))
		}

		const sessionToken = auth.generateSessionToken()
		const session = await auth.createSession(sessionToken, existingUser.id)
		auth.setSessionTokenCookie(getRequestEvent(), sessionToken, session.expiresAt)
	} else {
		const [taken] = await db.select({ id: user.id }).from(user).where(eq(user.username, username))
		if (taken) invalid(issue.username('That username is taken.'))

		const userId = crypto.randomUUID()
		const passwordHash = await hash(password, ARGON_OPTS)
		await db.insert(user).values({ id: userId, username, passwordHash })

		const sessionToken = auth.generateSessionToken()
		const session = await auth.createSession(sessionToken, userId)
		auth.setSessionTokenCookie(getRequestEvent(), sessionToken, session.expiresAt)
	}

	return redirect(302, '/')
})

// Completes a first-time OAuth sign-up: the provider identity is held in a signed
// pending cookie (set in finishOAuthLogin); here the user picks their username and we
// create the account, link the provider, and start a session.
export const chooseUsername = form(chooseUsernameSchema, async ({ username }, issue) => {
	const event = getRequestEvent()
	const pending = readPendingSignup(event)
	if (!pending) redirect(302, '/login')

	const [taken] = await db.select({ id: user.id }).from(user).where(eq(user.username, username))
	if (taken) invalid(issue.username('That username is taken.'))

	const userId = crypto.randomUUID()
	await db.insert(user).values({ id: userId, username, email: pending.email })
	await createOAuthAccount({ provider: pending.provider, providerUserId: pending.providerUserId, userId })

	const sessionToken = auth.generateSessionToken()
	const session = await auth.createSession(sessionToken, userId)
	auth.setSessionTokenCookie(event, sessionToken, session.expiresAt)
	clearPendingSignup(event)

	redirect(302, '/')
})

// Which login methods the current user has, for the /account "Connected accounts" card.
export const getAccountConnections = query(async () => {
	const current = await getLoggedInUser()
	const accounts = await getOAuthAccountsByUser(current.id)
	const [row] = await db.select({ passwordHash: user.passwordHash }).from(user).where(eq(user.id, current.id))
	return {
		username: current.username,
		providers: accounts.map((a) => a.provider),
		hasPassword: !!row?.passwordHash
	}
})

export const disconnectOAuth = command(v.picklist(['google', 'github']), async (provider) => {
	const current = await getLoggedInUser()
	const accounts = await getOAuthAccountsByUser(current.id)
	const [row] = await db.select({ passwordHash: user.passwordHash }).from(user).where(eq(user.id, current.id))
	const hasPassword = !!row?.passwordHash

	// Never let a user remove their last way to sign in.
	const remaining = accounts.filter((a) => a.provider !== provider).length + (hasPassword ? 1 : 0)
	if (remaining < 1) return { ok: false as const, message: "That's your only way to sign in — set a password first." }

	await db.delete(oauthAccount).where(and(eq(oauthAccount.userId, current.id), eq(oauthAccount.provider, provider)))
	getAccountConnections().refresh()
	return { ok: true as const }
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
