import { pgTable, uuid, varchar, timestamp, integer, text, primaryKey, date, unique } from 'drizzle-orm/pg-core'
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
	// Nullable: set only on OAuth-created accounts (from a verified provider email) and
	// used to auto-link OAuth logins. Password accounts have no email.
	email: varchar('email', { length: 255 }).unique(),
	passwordHash: varchar('passwordHash', { length: 255 }),
	...timestamps
})
export const usersRelations = relations(user, ({ many }) => ({
	oauthAccounts: many(oauthAccount),
	payments: many(payment),
	tags: many(tag),
	budgets: many(budget),
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

export const tag = pgTable(
	'Tag',
	{
		id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
		name: varchar('name', { length: 255 }).notNull(),
		color: varchar('color', { length: 32 }).notNull().default('sage'),
		icon: varchar('icon', { length: 64 }).notNull().default('Tag'),
		// Optional per-tag monthly budget, in whole dollars.
		budget: integer('budget'),
		userId: uuid('userId')
			.notNull()
			.references(() => user.id)
	},
	(table) => ({
		namePerUser: unique('Tag_userId_name_unique').on(table.userId, table.name)
	})
)
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

// A budget is an overall monthly spending cap over a [startMonth, endMonth] range.
// endMonth may be null (open-ended). Amounts are whole dollars.
export const budget = pgTable('Budget', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	amount: integer('amount').notNull(),
	startMonth: date('startMonth', { mode: 'date' }).notNull(),
	endMonth: date('endMonth', { mode: 'date' }),
	...timestamps,
	userId: uuid('userId')
		.notNull()
		.references(() => user.id)
})
export const budgetsRelations = relations(budget, ({ one }) => ({
	user: one(user, {
		fields: [budget.userId],
		references: [user.id]
	})
}))

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
