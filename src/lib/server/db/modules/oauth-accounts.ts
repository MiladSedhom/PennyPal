import { db } from '../index'
import { oauthAccount } from '../schema'
import { eq } from 'drizzle-orm'

export async function getOAuthAccount(providerId: string) {
	return await db.query.oauthAccount.findFirst({
		where: eq(oauthAccount.providerId, providerId),
		with: {
			user: true
		}
	})
}

export async function getOAuthAccountByProviderUserId(providerUserId: string) {
	return await db.query.oauthAccount.findFirst({
		where: eq(oauthAccount.providerUserId, providerUserId),
		with: {
			user: true
		}
	})
}

export async function getOAuthAccountsByUser(userId: string) {
	return await db.query.oauthAccount.findMany({
		where: eq(oauthAccount.userId, userId)
	})
}

export async function createOAuthAccount(data: { providerUserId: string; userId: string }) {
	const [account] = await db.insert(oauthAccount).values(data).returning()
	return account
}

export async function deleteOAuthAccount(providerId: string) {
	await db.delete(oauthAccount).where(eq(oauthAccount.providerId, providerId))
}
