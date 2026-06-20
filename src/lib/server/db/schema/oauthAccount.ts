import { pgTable, varchar, uuid, primaryKey } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { user } from './user'

// One row per (provider, account) pair. A user may link several providers, so the
// identity is the composite (provider, providerUserId) — not a synthetic id.
export const oauthAccount = pgTable(
	'Oauth_account',
	{
		provider: varchar('provider', { length: 32 }).notNull(), // 'google' | 'github'
		providerUserId: varchar('provider_user_id', { length: 255 }).notNull(),
		userId: uuid('userId')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' })
	},
	(table) => ({
		pk: primaryKey({ columns: [table.provider, table.providerUserId] })
	})
)
export const oauthAccountsRelations = relations(oauthAccount, ({ one }) => ({
	user: one(user, {
		fields: [oauthAccount.userId],
		references: [user.id]
	})
}))
