import type { RequestHandler } from './$types'
import { redirect } from '@sveltejs/kit'
import { generateCodeVerifier, generateState } from 'arctic'
import { googleClient } from '$lib/server/oauth'

export const GET: RequestHandler = (event) => {
	const state = generateState()
	const codeVerifier = generateCodeVerifier()
	const url = googleClient(event.url.origin).createAuthorizationURL(state, codeVerifier, ['openid', 'email', 'profile'])

	const opts = { httpOnly: true, secure: !import.meta.env.DEV, sameSite: 'lax', path: '/', maxAge: 600 } as const
	event.cookies.set('google_oauth_state', state, opts)
	event.cookies.set('google_code_verifier', codeVerifier, opts)
	// Started from /account "Connect" → link to the current user instead of logging in.
	if (event.url.searchParams.has('link')) event.cookies.set('oauth_link', '1', opts)

	redirect(302, url.toString())
}
