import { pgTable, integer, date, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { timestamps } from './helpers'
import { user } from './user'

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
