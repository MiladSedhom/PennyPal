import { db } from '$lib/server/database'
import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { addPayment } from '$lib/server/database'
import { paymentSchema, searchParamsSchema } from '../../lib/zodSchemas'

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) throw redirect(303, '/login')

	const searchParams = searchParamsSchema.parse(Object.fromEntries(url.searchParams))

	const tagsList = searchParams.tags.map((t) => ({
		tag: {
			name: t
		}
	}))

	console.log(Object.fromEntries(url.searchParams))
	console.log('sp: ', searchParams)
	console.log('spt: ', searchParams.tags)
	console.log(tagsList)

	try {
		const payments = await db.payment.findMany({
			where: {
				userId: locals.user.id,
				createdAt: { gte: searchParams.startDate, lte: searchParams.endDate },
				tags: {
					every: {
						OR: tagsList
					}
				}
			},
			include: { tags: { include: { tag: { select: { name: true } } } } },
			orderBy: [
				searchParams.sortBy === 'amount'
					? {
							amount: searchParams.sortType
						}
					: {
							createdAt: searchParams.sortType
						}
			]
		})

		const formatedPayments = payments.map((p) => ({ ...p, tags: p.tags.map((o) => o.tag?.name) }))

		return { payments: formatedPayments }
	} catch (e) {
		console.log(e)
	}
}

export const actions: Actions = {
	addPayment: async ({ request, locals }) => {
		const formData = await request.formData()

		//validate from data
		const result = paymentSchema.safeParse(formData)

		if (!result.success) {
			return fail(400, {
				data: Object.fromEntries(formData),
				errors: result.error.flatten().fieldErrors
			})
		}

		//query
		try {
			//@ts-ignore
			await addPayment({ ...result.data }, locals.user.id)
			return { succes: true }
		} catch (error) {
			console.log(error)
			fail(500, { error })
		}
	}
}
