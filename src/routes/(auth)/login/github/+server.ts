import type { RequestHandler } from './$types'
import { redirect } from '@sveltejs/kit'
import { generateState } from 'arctic'
import { githubClient } from '$lib/server/oauth'

export const GET: RequestHandler = (event) => {
	const state = generateState()
	const url = githubClient(event.url.origin).createAuthorizationURL(state, ['user:email'])

	const opts = { httpOnly: true, secure: !import.meta.env.DEV, sameSite: 'lax', path: '/', maxAge: 600 } as const
	event.cookies.set('github_oauth_state', state, opts)
	// Started from /account "Connect" → link to the current user instead of logging in.
	if (event.url.searchParams.has('link')) event.cookies.set('oauth_link', '1', opts)

	redirect(302, url.toString())
}
