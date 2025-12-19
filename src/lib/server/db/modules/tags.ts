import { db } from '../index';
import { tags, paymentsToTags } from '../schema';
import { eq } from 'drizzle-orm';

export async function getTag(tagId: number) {
	return await db.query.tags.findFirst({
		where: eq(tags.id, tagId),
		with: {
			user: true,
			paymentsToTags: {
				with: {
					payment: true
				}
			}
		}
	});
}

export async function getTagsByUser(userId: string) {
	return await db.query.tags.findMany({
		where: eq(tags.userId, userId),
		orderBy: tags.name
	});
}

export async function getAllTags() {
	return await db.query.tags.findMany({
		orderBy: tags.name,
		with: {
			user: true
		}
	});
}

export async function createTag(data: { name: string; userId: string }) {
	const [tag] = await db.insert(tags).values(data).returning();
	return tag;
}

export async function updateTag(tagId: number, data: { name: string }) {
	const [tag] = await db.update(tags).set(data).where(eq(tags.id, tagId)).returning();
	return tag;
}

export async function deleteTag(tagId: number) {
	await db.delete(paymentsToTags).where(eq(paymentsToTags.tagId, tagId));
	await db.delete(tags).where(eq(tags.id, tagId));
}
