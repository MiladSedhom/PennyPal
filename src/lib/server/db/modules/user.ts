import { db } from '../index';
import { users } from '../schema';
import { eq, desc } from 'drizzle-orm';

export async function getUser(userId: string) {
	return await db.query.users.findFirst({
		where: eq(users.id, userId),
		with: {
			payments: true,
			tags: true
		}
	});
}

export async function getAllUsers() {
	return await db.query.users.findMany({
		orderBy: desc(users.createdAt)
	});
}

export async function createUser(data: { username: string; passwordHash?: string }) {
	const [user] = await db.insert(users).values(data).returning();
	return user;
}

export async function updateUser(
	userId: string,
	data: { username?: string; passwordHash?: string }
) {
	const [user] = await db.update(users).set(data).where(eq(users.id, userId)).returning();
	return user;
}

export async function deleteUser(userId: string) {
	await db.delete(users).where(eq(users.id, userId));
}
