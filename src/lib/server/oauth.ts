import type { RequestEvent } from '@sveltejs/kit'
import { redirect } from '@sveltejs/kit'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { Google, GitHub } from 'arctic'
import { env } from '$env/dynamic/private'
import { createSession, generateSessionToken, setSessionTokenCookie } from '$lib/server/auth'
import { createOAuthAccount, getOAuthAccount, getUserByEmail } from '$lib/server/db/modules/oauth-accounts'

export type OAuthProvider = 'google' | 'github'

// Arctic clients are built per-request so the redirect URI tracks the current origin
// (localhost in dev, the deployed origin in prod). Both must be registered with the provider.
export function googleClient(origin: string) {
	return new Google(
		requireEnv('GOOGLE_CLIENT_ID'),
		requireEnv('GOOGLE_CLIENT_SECRET'),
		`${origin}/login/google/callback`
	)
}

export function githubClient(origin: string) {
	return new GitHub(
		requireEnv('GITHUB_CLIENT_ID'),
		requireEnv('GITHUB_CLIENT_SECRET'),
		`${origin}/login/github/callback`
	)
}

function requireEnv(name: string): string {
	const value = env[name]
	if (!value) throw new Error(`${name} is not set`)
	return value
}

type OAuthProfile = {
	provider: OAuthProvider
	providerUserId: string
	email: string | null
	emailVerified: boolean
	suggestedName: string
}

/**
 * Resolve an OAuth login to a session. Either:
 *  1. the provider account already exists → sign in,
 *  2. a verified email matches an existing user → link the provider and sign in, or
 *  3. it's a brand-new identity → stash a signed pending cookie and send the user to pick a username.
 * Always ends by throwing a redirect.
 */
export async function finishOAuthLogin(event: RequestEvent, profile: OAuthProfile): Promise<never> {
	const existing = await getOAuthAccount(profile.provider, profile.providerUserId)
	if (existing) {
		await startSession(event, existing.userId)
		redirect(302, '/')
	}

	if (profile.emailVerified && profile.email) {
		const linkable = await getUserByEmail(profile.email)
		if (linkable) {
			await createOAuthAccount({
				provider: profile.provider,
				providerUserId: profile.providerUserId,
				userId: linkable.id
			})
			await startSession(event, linkable.id)
			redirect(302, '/')
		}
	}

	setPendingSignup(event, {
		provider: profile.provider,
		providerUserId: profile.providerUserId,
		// Only persist an email we trust — an unverified address must not become the
		// account's email, or it could later auto-link a different provider.
		email: profile.emailVerified ? profile.email : null,
		suggestedName: profile.suggestedName
	})
	redirect(302, '/login/username')
}

/**
 * Link a provider to the already-logged-in user (the "Connect" button on /account).
 * Falls back to a normal login if there's somehow no active session.
 */
export async function linkOAuthAccount(event: RequestEvent, profile: OAuthProfile): Promise<never> {
	const userId = event.locals.user?.id
	if (!userId) return finishOAuthLogin(event, profile)

	const existing = await getOAuthAccount(profile.provider, profile.providerUserId)
	if (existing) {
		// Already linked to this user → no-op; linked to someone else → refuse.
		redirect(302, existing.userId === userId ? `/account?linked=${profile.provider}` : '/account?error=in_use')
	}

	await createOAuthAccount({ provider: profile.provider, providerUserId: profile.providerUserId, userId })
	redirect(302, `/account?linked=${profile.provider}`)
}

async function startSession(event: RequestEvent, userId: string) {
	const token = generateSessionToken()
	const session = await createSession(token, userId)
	setSessionTokenCookie(event, token, session.expiresAt)
}

// ---------------------------------------------------------------------------
// Pending-signup cookie (new OAuth user, awaiting username choice)
// ---------------------------------------------------------------------------

export type PendingSignup = {
	provider: OAuthProvider
	providerUserId: string
	email: string | null
	suggestedName: string
}

const PENDING_COOKIE = 'oauth_pending'
const PENDING_TTL_SECONDS = 60 * 10

// HMAC-signed so a user can't forge a providerUserId and squat someone else's identity.
function sign(payload: string): string {
	return createHmac('sha256', requireEnv('AUTH_SECRET')).update(payload).digest('base64url')
}

export function setPendingSignup(event: RequestEvent, data: PendingSignup) {
	const payload = Buffer.from(JSON.stringify(data), 'utf8').toString('base64url')
	event.cookies.set(PENDING_COOKIE, `${payload}.${sign(payload)}`, {
		httpOnly: true,
		secure: !import.meta.env.DEV,
		sameSite: 'lax',
		path: '/',
		maxAge: PENDING_TTL_SECONDS
	})
}

export function readPendingSignup(event: RequestEvent): PendingSignup | null {
	const cookie = event.cookies.get(PENDING_COOKIE)
	if (!cookie) return null
	const [payload, signature] = cookie.split('.')
	if (!payload || !signature) return null

	const expected = sign(payload)
	const a = Buffer.from(signature)
	const b = Buffer.from(expected)
	if (a.length !== b.length || !timingSafeEqual(a, b)) return null

	try {
		return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as PendingSignup
	} catch {
		return null
	}
}

export function clearPendingSignup(event: RequestEvent) {
	event.cookies.delete(PENDING_COOKIE, { path: '/' })
}
