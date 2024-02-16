import type { RequestHandler } from './$types'
import { github, lucia } from '$lib/server/auth'
import { db } from '$lib/server/database'

export const GET: RequestHandler = async (event) => {
	const code = event.url.searchParams.get('code')
	const state = event.url.searchParams.get('state')
	const storedState = event.cookies.get('github_oauth_state') ?? null

	//validate
	if (!code || !state || !storedState || state !== storedState)
		return new Response(null, { status: 400 })

	try {
		//get the token
		const tokens = await github.validateAuthorizationCode(code)

		//send the token and get the user
		const githubUserResponse = await fetch('https://api.github.com/user', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		})

		const githubUser = await githubUserResponse.json()

		const user = await db.user.findUnique({
			where: {
				github_id: githubUser.id
			}
		})

		if (user) {
			const session = await lucia.createSession(user.id, {})
			const sessionCookie = lucia.createSessionCookie(session.id)
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			})
		} else {
			const newUser = await db.user.create({
				data: {
					github_id: githubUser.id,
					username: githubUser.login
				}
			})
			const session = await lucia.createSession(newUser.id, {})
			const sessionCookie = lucia.createSessionCookie(session.id)
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			})
		}

		return new Response(null, {
			status: 302,
			headers: {
				Location: '/'
			}
		})
	} catch (error) {
		console.log(error)
		return new Response(null, {
			status: 500
		})
	}
}
