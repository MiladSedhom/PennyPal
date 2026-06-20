import { pgTable, integer, primaryKey } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { payment } from './payment'
import { tag } from './tag'

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
