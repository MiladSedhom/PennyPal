import { pgTable, uuid, varchar, timestamp, integer, text, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const timestamps = {
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt')
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
};

export const users = pgTable('User', {
	id: uuid('id').primaryKey().defaultRandom(),
	username: varchar('username', { length: 255 }).notNull().unique(),
	passwordHash: varchar('passwordHash', { length: 255 }),
	...timestamps
});
export const usersRelations = relations(users, ({ many }) => ({
	oauthAccounts: many(oauthAccounts),
	payments: many(payments),
	tags: many(tags),
	sessions: many(sessions)
}));

export const payments = pgTable('Payment', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	amount: integer('amount').notNull(),
	note: text('note'),
	...timestamps,
	userId: uuid('userId')
		.notNull()
		.references(() => users.id)
});
export const paymentsRelations = relations(payments, ({ one, many }) => ({
	user: one(users, {
		fields: [payments.userId],
		references: [users.id]
	}),
	paymentsToTags: many(paymentsToTags)
}));

export const tags = pgTable('Tag', {
	id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
	name: varchar('name', { length: 255 }).notNull().unique(),
	userId: uuid('userId')
		.notNull()
		.references(() => users.id)
});
export const tagsRelations = relations(tags, ({ many, one }) => ({
	paymentsToTags: many(paymentsToTags),
	user: one(users, {
		fields: [tags.userId],
		references: [users.id]
	})
}));

export const paymentsToTags = pgTable(
	'_PaymentToTag',
	{
		paymentId: integer('A')
			.notNull()
			.references(() => payments.id),
		tagId: integer('B')
			.notNull()
			.references(() => tags.id)
	},
	(table) => ({
		pk: primaryKey({ columns: [table.paymentId, table.tagId] })
	})
);
export const paymentsToTagsRelations = relations(paymentsToTags, ({ one }) => ({
	payment: one(payments, {
		fields: [paymentsToTags.paymentId],
		references: [payments.id]
	}),
	tag: one(tags, {
		fields: [paymentsToTags.tagId],
		references: [tags.id]
	})
}));

export const oauthAccounts = pgTable('Oauth_account', {
	providerId: uuid('provider_id').primaryKey().defaultRandom(),
	providerUserId: varchar('provider_user_id', { length: 255 }).notNull().unique(),
	userId: uuid('userId')
		.notNull()
		.references(() => users.id)
});
export const oauthAccountsRelations = relations(oauthAccounts, ({ one }) => ({
	user: one(users, {
		fields: [oauthAccounts.userId],
		references: [users.id]
	})
}));

export const sessions = pgTable('Session', {
	id: varchar('id', { length: 255 }).primaryKey(),
	expiresAt: timestamp('expiresAt').notNull(),
	userId: uuid('userId')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' })
});
export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	})
}));
