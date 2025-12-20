import { pgTable, uuid, varchar, timestamp, integer, text, primaryKey } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const timestamps = {
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt')
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
}

export const user = pgTable('User', {
	id: uuid('id').primaryKey().defaultRandom(),
	username: varchar('username', { length: 255 }).notNull().unique(),
	passwordHash: varchar('passwordHash', { length: 255 }),
	...timestamps
})
export const usersRelations = relations(user, ({ many }) => ({
	oauthAccounts: many(oauthAccount),
	payments: many(payment),
	tags: many(tag),
	sessions: many(session)
}))

export const payment = pgTable('Payment', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	amount: integer('amount').notNull(),
	note: text('note'),
	...timestamps,
	userId: uuid('userId')
		.notNull()
		.references(() => user.id)
})
export const paymentsRelations = relations(payment, ({ one, many }) => ({
	user: one(user, {
		fields: [payment.userId],
		references: [user.id]
	}),
	paymentsToTags: many(paymentsToTags)
}))

export const tag = pgTable('Tag', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	name: varchar('name', { length: 255 }).notNull().unique(),
	userId: uuid('userId')
		.notNull()
		.references(() => user.id)
})
export const tagsRelations = relations(tag, ({ many, one }) => ({
	paymentsToTags: many(paymentsToTags),
	user: one(user, {
		fields: [tag.userId],
		references: [user.id]
	})
}))

export const paymentsToTags = pgTable(
	'_PaymentToTag',
	{
		paymentId: integer('A')
			.notNull()
			.references(() => payment.id),
		tagId: integer('B')
			.notNull()
			.references(() => tag.id)
	},
	(table) => ({
		pk: primaryKey({ columns: [table.paymentId, table.tagId] })
	})
)
export const paymentsToTagsRelations = relations(paymentsToTags, ({ one }) => ({
	payment: one(payment, {
		fields: [paymentsToTags.paymentId],
		references: [payment.id]
	}),
	tag: one(tag, {
		fields: [paymentsToTags.tagId],
		references: [tag.id]
	})
}))

export const oauthAccount = pgTable('Oauth_account', {
	providerId: uuid('provider_id').primaryKey().defaultRandom(),
	providerUserId: varchar('provider_user_id', { length: 255 }).notNull().unique(),
	userId: uuid('userId')
		.notNull()
		.references(() => user.id)
})
export const oauthAccountsRelations = relations(oauthAccount, ({ one }) => ({
	user: one(user, {
		fields: [oauthAccount.userId],
		references: [user.id]
	})
}))

export const session = pgTable('Session', {
	id: varchar('id', { length: 255 }).primaryKey(),
	expiresAt: timestamp('expiresAt').notNull(),
	userId: uuid('userId')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' })
})
export const sessionsRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	})
}))
