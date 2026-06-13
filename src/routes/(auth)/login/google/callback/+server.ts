import type { RequestHandler } from './$types'
import { decodeIdToken } from 'arctic'
import { finishOAuthLogin, googleClient, linkOAuthAccount } from '$lib/server/oauth'

type GoogleClaims = { sub: string; email?: string; email_verified?: boolean; name?: string }

export const GET: RequestHandler = async (event) => {
	const code = event.url.searchParams.get('code')
	const state = event.url.searchParams.get('state')
	const storedState = event.cookies.get('google_oauth_state')
	const codeVerifier = event.cookies.get('google_code_verifier')

	if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
		return new Response('Invalid OAuth request. Please try signing in again.', { status: 400 })
	}

	let claims: GoogleClaims
	try {
		const tokens = await googleClient(event.url.origin).validateAuthorizationCode(code, codeVerifier)
		claims = decodeIdToken(tokens.idToken()) as GoogleClaims
	} catch {
		return new Response('Failed to sign in with Google. Please try again.', { status: 400 })
	}

	const linking = event.cookies.get('oauth_link')
	if (linking) event.cookies.delete('oauth_link', { path: '/' })

	const profile = {
		provider: 'google' as const,
		providerUserId: claims.sub,
		email: claims.email ?? null,
		emailVerified: claims.email_verified ?? false,
		suggestedName: claims.name ?? claims.email?.split('@')[0] ?? ''
	}
	return await (linking ? linkOAuthAccount(event, profile) : finishOAuthLogin(event, profile))
}
