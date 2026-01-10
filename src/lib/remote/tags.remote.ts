import { form, query } from '$app/server'
import { db } from '$lib/server/db'
import { tag } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import { getLoggedInUser } from './auth.remote'
import * as v from 'valibot'

export const getTags = query(async () => {
	const user = await getLoggedInUser()

	return db.select().from(tag).where(eq(tag.userId, user.id))
})

export const createTag = form(
	v.object({
		name: v.string()
	}),
	async ({ name }) => {
		const user = await getLoggedInUser()
		await db.insert(tag).values({ name, userId: user.id })
		getTags().refresh()
	}
)
