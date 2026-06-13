import type { RequestHandler } from './$types'
import { finishOAuthLogin, githubClient, linkOAuthAccount } from '$lib/server/oauth'

type GitHubUser = { id: number; login: string; name: string | null; email: string | null }
type GitHubEmail = { email: string; primary: boolean; verified: boolean }

export const GET: RequestHandler = async (event) => {
	const code = event.url.searchParams.get('code')
	const state = event.url.searchParams.get('state')
	const storedState = event.cookies.get('github_oauth_state')

	if (!code || !state || !storedState || state !== storedState) {
		return new Response('Invalid OAuth request. Please try signing in again.', { status: 400 })
	}

	let ghUser: GitHubUser
	let primaryEmail: GitHubEmail | undefined
	try {
		const tokens = await githubClient(event.url.origin).validateAuthorizationCode(code)
		const headers = {
			Authorization: `Bearer ${tokens.accessToken()}`,
			'User-Agent': 'pennypal',
			Accept: 'application/vnd.github+json'
		}

		ghUser = (await fetch('https://api.github.com/user', { headers }).then((r) => r.json())) as GitHubUser
		const emails = (await fetch('https://api.github.com/user/emails', { headers }).then((r) =>
			r.json()
		)) as GitHubEmail[]
		primaryEmail = emails.find((e) => e.primary) ?? emails.find((e) => e.verified)
	} catch {
		return new Response('Failed to sign in with GitHub. Please try again.', { status: 400 })
	}

	const linking = event.cookies.get('oauth_link')
	if (linking) event.cookies.delete('oauth_link', { path: '/' })

	const profile = {
		provider: 'github' as const,
		providerUserId: String(ghUser.id),
		email: primaryEmail?.email ?? ghUser.email,
		emailVerified: primaryEmail?.verified ?? false,
		suggestedName: ghUser.login || ghUser.name || ''
	}
	return await (linking ? linkOAuthAccount(event, profile) : finishOAuthLogin(event, profile))
}
