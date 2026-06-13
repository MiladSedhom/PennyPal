import { db } from '../index'
import { oauthAccount, user } from '../schema'
import { and, eq } from 'drizzle-orm'

export async function getOAuthAccount(provider: string, providerUserId: string) {
	return await db.query.oauthAccount.findFirst({
		where: and(eq(oauthAccount.provider, provider), eq(oauthAccount.providerUserId, providerUserId)),
		with: {
			user: true
		}
	})
}

export async function createOAuthAccount(data: { provider: string; providerUserId: string; userId: string }) {
	const [account] = await db.insert(oauthAccount).values(data).returning()
	return account
}

export async function getOAuthAccountsByUser(userId: string) {
	return await db.query.oauthAccount.findMany({
		where: eq(oauthAccount.userId, userId)
	})
}

export async function getUserByEmail(email: string) {
	return await db.query.user.findFirst({
		where: eq(user.email, email)
	})
}
