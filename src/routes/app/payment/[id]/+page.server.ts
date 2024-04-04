import { updatePayment } from '$lib/server/database.js'
import { paymentSchema } from '$lib/zodSchemas.js'
import { fail } from '@sveltejs/kit'

export const actions = {
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
