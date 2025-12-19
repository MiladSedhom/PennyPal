import { db } from '../index';
import { oauthAccounts } from '../schema';
import { eq } from 'drizzle-orm';

export async function getOAuthAccount(providerId: string) {
	return await db.query.oauthAccounts.findFirst({
		where: eq(oauthAccounts.providerId, providerId),
		with: {
			user: true
		}
	});
}

export async function getOAuthAccountByProviderUserId(providerUserId: string) {
	return await db.query.oauthAccounts.findFirst({
		where: eq(oauthAccounts.providerUserId, providerUserId),
		with: {
			user: true
		}
	});
}

export async function getOAuthAccountsByUser(userId: string) {
	return await db.query.oauthAccounts.findMany({
		where: eq(oauthAccounts.userId, userId)
	});
}

export async function createOAuthAccount(data: { providerUserId: string; userId: string }) {
	const [account] = await db.insert(oauthAccounts).values(data).returning();
	return account;
}

export async function deleteOAuthAccount(providerId: string) {
	await db.delete(oauthAccounts).where(eq(oauthAccounts.providerId, providerId));
}
