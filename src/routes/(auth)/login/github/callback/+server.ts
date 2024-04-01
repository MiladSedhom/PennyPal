import type { RequestEvent, RequestHandler } from './$types'
import { github, lucia } from '$lib/server/auth'
import { db } from '$lib/server/database'

export const GET: RequestHandler = async (event) => {
	const code = event.url.searchParams.get('code')
	const state = event.url.searchParams.get('state')
	const storedState = event.cookies.get('github_oauth_state') ?? null

	//validate
	if (!code || !state || !storedState || state !== storedState) return new Response(null, { status: 400 })

	try {
		//get the github token token
		const tokens = await github.validateAuthorizationCode(code)

		//send the token and get the github user
		const githubUserResponse = await fetch('https://api.github.com/user', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		})

		const githubUser = await githubUserResponse.json()

		const oauthAcc = await db.oauth_account.findUnique({
			where: {
				provider_user_id: String(githubUser.id)
			}
		})

		if (oauthAcc) {
			await createAndSetSessinoCookie(oauthAcc.userId, event)
		} else {
			const newUser = await db.user.create({
				data: {
					username: githubUser.login,
					provider: {
						create: { provider_id: 'github', provider_user_id: String(githubUser.id) }
					}
				}
			})
			await createAndSetSessinoCookie(newUser.id, event)
		}

		return new Response(null, {
			status: 302,
			headers: {
				Location: '/app'
			}
		})
	} catch (error) {
		console.log(error)
		return new Response(null, {
			status: 500
		})
	}
}

const createAndSetSessinoCookie = async (userId: string, event: RequestEvent) => {
	const session = await lucia.createSession(userId, {})
	const sessionCookie = lucia.createSessionCookie(session.id)
	event.cookies.set(sessionCookie.name, sessionCookie.value, {
		path: '.',
		...sessionCookie.attributes
	})
}
