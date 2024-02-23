import { db } from '$lib/server/database'
import { fail, redirect } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'

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
		const amount = Number(formData.get('amount'))
		const tags = formData.getAll('tags').map((t) => String(t))
		const date = new Date(String(formData.get('date')))
		const note = String(formData.get('note'))

		if (!locals.user) return fail(400, { notAuthrized: true })

		try {
			const storedTags = await db.tag.findMany({
				where: {
					OR: tags.map((n) => ({
						name: n
					}))
				}
			})
			const newTagsNames = tags.filter((name) => !storedTags.some((tag) => tag.name === name))

			const tagsCreate = [
				...storedTags.map((t) => ({ tag: { connect: { id: t.id } } })),
				...newTagsNames.map((t) => ({ tag: { create: { name: t } } }))
			]

			const payment = await db.payment.create({
				data: {
					amount,
					note,
					createdAt: new Date(date),
					userId: locals.user.id,
					tags: {
						create: tagsCreate
					}
				},
				include: { tags: { select: { tag: { select: { name: true } } } } }
			})

			const p = { ...payment, tags: payment.tags.map((o) => o.tag?.name) }
		} catch (error) {
			console.log(error)
			fail(500, { error })
		}
	}
}
