import { timestamp } from 'drizzle-orm/pg-core'

export const timestamps = {
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt')
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date())
}
