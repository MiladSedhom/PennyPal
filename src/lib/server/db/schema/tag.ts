import { pgTable, integer, varchar, uuid, unique } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { user } from './user'
import { paymentsToTags } from './paymentsToTags'
import { recurringPaymentsToTags } from './recurringPaymentsToTags'

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
	recurringPaymentsToTags: many(recurringPaymentsToTags),
	user: one(user, {
		fields: [tag.userId],
		references: [user.id]
	})
}))
