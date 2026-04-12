import { db } from '../index'
import { session as sessionTable } from '../schema'
import { eq, desc } from 'drizzle-orm'

export async function getSession(sessionId: string) {
	return await db.query.session.findFirst({
		where: eq(sessionTable.id, sessionId),
		with: {
			user: true
		}
	})
}

export async function getSessionsByUser(userId: string) {
	return await db.query.session.findMany({
		where: eq(sessionTable.userId, userId),
		orderBy: desc(sessionTable.expiresAt)
	})
}

export async function createSession(data: { id: string; expiresAt: Date; userId: string }) {
	const [session] = await db.insert(sessionTable).values(data).returning()
	return session
}

export async function deleteSession(sessionId: string) {
	await db.delete(sessionTable).where(eq(sessionTable.id, sessionId))
}

export async function deleteExpiredSessions() {
	await db.delete(sessionTable).where(eq(sessionTable.expiresAt, new Date()))
}
