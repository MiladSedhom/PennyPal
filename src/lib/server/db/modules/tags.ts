import { db } from '../index'
import { tag as tagTable, paymentsToTags } from '../schema'
import { eq } from 'drizzle-orm'

export async function getTag(tagId: number) {
	return await db.query.tag.findFirst({
		where: eq(tagTable.id, tagId),
		with: {
			user: true,
			paymentsToTags: {
				with: {
					payment: true
				}
			}
		}
	})
}

export async function getTagsByUser(userId: string) {
	return await db.query.tag.findMany({
		where: eq(tagTable.userId, userId),
		orderBy: tagTable.name
	})
}

export async function getAllTags() {
	return await db.query.tag.findMany({
		orderBy: tagTable.name,
		with: {
			user: true
		}
	})
}

export async function createTag(data: { name: string; userId: string }) {
	const [tag] = await db.insert(tagTable).values(data).returning()
	return tag
}

export async function updateTag(tagId: number, data: { name: string }) {
	const [tag] = await db.update(tagTable).set(data).where(eq(tagTable.id, tagId)).returning()
	return tag
}

export async function deleteTag(tagId: number) {
	await db.delete(paymentsToTags).where(eq(paymentsToTags.tagId, tagId))
	await db.delete(tagTable).where(eq(tagTable.id, tagId))
}
