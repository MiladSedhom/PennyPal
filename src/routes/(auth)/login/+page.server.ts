import { fail, redirect } from '@sveltejs/kit'
import type { Actions } from './$types'
import { db } from '$lib/server/database'
import bcrypt from 'bcrypt'
import { lucia } from '$lib/server/auth'

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const formData = await request.formData()
		const username = formData.get('username')
		const password = formData.get('password')

		if (typeof username !== 'string' || typeof password !== 'string' || !username || !password)
			return fail(400, { error: 'Please enter both username and password' })

		// if credentials is wrong
		const user = await db.user.findUnique({ where: { username } })
		if (!user) return fail(400, { error: 'Invalid username or password' })

		if (user.passwordHash) {
			const userPassword = bcrypt.compare(password, user.passwordHash)
			if (!userPassword) return fail(400, { error: 'Invalid username or password' })
		}

		// else login and redirect

		// generate new session and store it
		const session = await lucia.createSession(user.id, {})
		const sessionCookie = lucia.createSessionCookie(session.id)

		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '/',
			...sessionCookie.attributes
		})

		redirect(302, '/app')
	}
}
