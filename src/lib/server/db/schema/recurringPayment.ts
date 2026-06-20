import { pgTable, pgEnum, integer, text, timestamp, boolean, uuid, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { timestamps } from './helpers'
import { user } from './user'
import { payment } from './payment'
import { recurringPaymentsToTags } from './recurringPaymentsToTags'

export const recurringIntervalEnum = pgEnum('RecurringInterval', ['weekly', 'monthly', 'yearly', 'daily'])

export const recurringPayment = pgTable(
	'RecurringPayment',
	{
		id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
		amount: integer('amount').notNull(),
		note: text('note'),
		interval: recurringIntervalEnum('interval').notNull(),
		intervalCount: integer('intervalCount').notNull().default(1),
		// The anchor: the first occurrence fires ON startDate, and all later
		// occurrences are computed from it (see src/lib/recurrence.ts).
		startDate: timestamp('startDate').notNull(),
		nextRunAt: timestamp('nextRunAt').notNull(),
		endDate: timestamp('endDate'),
		paused: boolean('paused').notNull().default(false),
		// Fixed (false): occurrences stay on the calendar anchor — rent on the 1st.
		// Rolling (true): each cycle re-anchors to the actual payment date — quota subs;
		// pay early/late and the schedule follows (see reanchorRollingRule).
		rolling: boolean('rolling').notNull().default(false),
		...timestamps,
		userId: uuid('userId')
			.notNull()
			.references(() => user.id)
	},
	(table) => ({
		userNextRun: index('RecurringPayment_userId_nextRunAt_idx').on(table.userId, table.nextRunAt)
	})
)
export const recurringPaymentsRelations = relations(recurringPayment, ({ one, many }) => ({
	user: one(user, {
		fields: [recurringPayment.userId],
		references: [user.id]
	}),
	recurringPaymentsToTags: many(recurringPaymentsToTags),
	payments: many(payment)
}))
