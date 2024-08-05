export const ssr = false

import { addPayment, removePayment, updatePayment } from '$lib/server/database'
import { fail } from '@sveltejs/kit'
import type { Actions } from './$types'
import { paymentSchema } from '../../lib/zodSchemas'

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
		const formData = await request.formData()
		const id = Number(formData.get('id'))

		if (!locals.user) return

		try {
			await removePayment(id, locals.user?.id)
		} catch (e) {
			console.log(e)
		}
	},
	updatePayment: async ({ request, locals }) => {
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
			// @ts-ignore
			await updatePayment({ ...result.data }, locals.user.id)
			return { success: true }
		} catch (error) {
			console.log(error)
			fail(500, { error })
		}
	}
}
