import { pgTable, varchar, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { user } from './user'

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
