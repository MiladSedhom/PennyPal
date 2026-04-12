import { db } from '../index'
import { user } from '../schema'
import { eq, desc } from 'drizzle-orm'

export async function getUser(userId: string) {
	return await db.query.user.findFirst({
		where: eq(user.id, userId),
		with: {
			payments: true,
			tags: true
		}
	})
}

export async function getAlluser() {
	return await db.query.user.findMany({
		orderBy: desc(user.createdAt)
	})
}

export async function createUser(data: { username: string; passwordHash?: string }) {
	const [resultUser] = await db.insert(user).values(data).returning()
	return resultUser
}

export async function updateUser(userId: string, data: { username?: string; passwordHash?: string }) {
	const [resultUser] = await db.update(user).set(data).where(eq(user.id, userId)).returning()
	return resultUser
}

export async function deleteUser(userId: string) {
	await db.delete(user).where(eq(user.id, userId))
}
