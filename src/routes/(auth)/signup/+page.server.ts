import { fail, redirect } from '@sveltejs/kit'
import type { Action } from './$types'
import { db } from '$lib/server/database'
import bcrypt from 'bcrypt'

const register: Action = async ({ request }) => {
	const formData = await request.formData()
	const username = formData.get('username')
	const password = formData.get('password')

	//validate form
	if (typeof username !== 'string' || typeof password !== 'string' || !username || !password)
		return fail(400, { invalid: true })

	//if ther is a user with the same name return name is already taken
	const user = await db.user.findUnique({ where: { username } })

	if (user) return fail(400, { usernameTaken: true })

	//if success return add them to db and log them in
	try {
		await db.user.create({
			data: {
				username,
				passwordHash: await bcrypt.hash(password, 10)
			}
		})
	} catch (error) {
		console.log(error)
		return fail(500, { message: 'oops' })
	}

	redirect(303, '/login')
}

export const actions = { register }
