import { getPayments, getUserTags } from '$lib/server/database'
import { searchParamsSchema } from '$lib/zodSchemas'
import { redirect } from '@sveltejs/kit'
import type { LayoutServerLoad } from '../$types'

export const load: LayoutServerLoad = async ({ locals, url }) => {
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
