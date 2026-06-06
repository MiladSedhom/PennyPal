import { query } from '$app/server'
import { db } from '$lib/server/db'
import { budget } from '$lib/server/db/schema'
import { and, eq, lte, gte, or, isNull, desc } from 'drizzle-orm'
import { getLoggedInUser } from './auth.remote'

/** The budget whose range contains today (endMonth null = open-ended), if any. */
export const getCurrentBudget = query(async () => {
	const user = await getLoggedInUser()
	const today = new Date()
	today.setHours(0, 0, 0, 0)

	const rows = await db
		.select()
		.from(budget)
		.where(
			and(
				eq(budget.userId, user.id),
				lte(budget.startMonth, today),
				or(isNull(budget.endMonth), gte(budget.endMonth, today))
			)
		)
		.orderBy(desc(budget.startMonth))
		.limit(1)

	return rows.at(0) ?? null
})
