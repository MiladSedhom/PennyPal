import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { timestamps } from './helpers'
import { oauthAccount } from './oauthAccount'
import { payment } from './payment'
import { tag } from './tag'
import { budget } from './budget'
import { session } from './session'
import { recurringPayment } from './recurringPayment'

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
	sessions: many(session),
	recurringPayments: many(recurringPayment)
}))
