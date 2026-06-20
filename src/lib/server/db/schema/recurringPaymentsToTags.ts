import { pgTable, integer, primaryKey } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { recurringPayment } from './recurringPayment'
import { tag } from './tag'

export const recurringPaymentsToTags = pgTable(
	'_RecurringPaymentToTag',
	{
		recurringPaymentId: integer('A')
			.notNull()
			.references(() => recurringPayment.id),
		tagId: integer('B')
			.notNull()
			.references(() => tag.id)
	},
	(table) => ({
		pk: primaryKey({ columns: [table.recurringPaymentId, table.tagId] })
	})
)
export const recurringPaymentsToTagsRelations = relations(recurringPaymentsToTags, ({ one }) => ({
	recurringPayment: one(recurringPayment, {
		fields: [recurringPaymentsToTags.recurringPaymentId],
		references: [recurringPayment.id]
	}),
	tag: one(tag, {
		fields: [recurringPaymentsToTags.tagId],
		references: [tag.id]
	})
}))
