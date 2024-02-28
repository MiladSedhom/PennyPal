import { db } from '$lib/server/database'
import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { addPayment } from '$lib/server/database'
import { paymentSchema } from './zodSchema'

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(303, '/login')

	const payments = await db.payment.findMany({
		where: { userId: locals.user.id },
		include: { tags: { include: { tag: { select: { name: true } } } } }
	})

	const formatedPayments = payments.map((p) => ({ ...p, tags: p.tags.map((o) => o.tag?.name) }))

	return { payments: formatedPayments }
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
