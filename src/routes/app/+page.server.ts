import { addPayment, getPayments, getUserTags, removePayment } from '$lib/server/database'
import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { paymentSchema, searchParamsSchema } from '../../lib/zodSchemas'

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) throw redirect(303, '/login')

	const searchParams = searchParamsSchema.parse(Object.fromEntries(url.searchParams))

	try {
		const payments = await getPayments(searchParams, locals.user.id)
		const tags = await getUserTags(locals.user.id)
		return { payments, tags }
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
	},
	removePayment: async ({ request, locals }) => {
		console.log('removein payment')
		const formData = await request.formData()
		const id = Number(formData.get('id'))

		if (!locals.user) return

		try {
			await removePayment(id, locals.user?.id)
		} catch (e) {
			console.log(e)
		}
	}
}
