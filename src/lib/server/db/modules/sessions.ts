import { db } from '../index';
import { sessions } from '../schema';
import { eq, desc } from 'drizzle-orm';

export async function getSession(sessionId: string) {
	return await db.query.sessions.findFirst({
		where: eq(sessions.id, sessionId),
		with: {
			user: true
		}
	});
}

export async function getSessionsByUser(userId: string) {
	return await db.query.sessions.findMany({
		where: eq(sessions.userId, userId),
		orderBy: desc(sessions.expiresAt)
	});
}

export async function createSession(data: { id: string; expiresAt: Date; userId: string }) {
	const [session] = await db.insert(sessions).values(data).returning();
	return session;
}

export async function deleteSession(sessionId: string) {
	await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function deleteExpiredSessions() {
	await db.delete(sessions).where(eq(sessions.expiresAt, new Date()));
}
