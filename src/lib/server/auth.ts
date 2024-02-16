import { Lucia } from 'lucia'
import { dev } from '$app/environment'
import { PrismaAdapter } from '@lucia-auth/adapter-prisma'
import { db } from './database'
import { GitHub } from 'arctic'

const adapter = new PrismaAdapter(db.session, db.user)

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			// set to `true` when using HTTPS
			secure: !dev
		}
	},
	getUserAttributes: (userAttributes) => {
		return { username: userAttributes.username, githubId: userAttributes.github_id }
	}
})

export const github = new GitHub(
	import.meta.env.GITHUB_CLIENT_ID,
	import.meta.env.GITHUB_CLIENT_SECRET
)

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia
		DatabaseUserAttributes: DatabaseUserAttributes
	}
}
//could be usful
//Quick tip, if you're using Prisma, you can set Lucia.UserAttributes to be equal to the Prisma type for the user table so you don't have to manually update it when your database model changes.

interface DatabaseUserAttributes {
	username: string
	github_id: string
}
