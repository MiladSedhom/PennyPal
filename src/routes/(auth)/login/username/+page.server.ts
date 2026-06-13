import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { readPendingSignup } from '$lib/server/oauth'

export const load: PageServerLoad = (event) => {
	if (event.locals.user) redirect(302, '/')

	const pending = readPendingSignup(event)
	if (!pending) redirect(302, '/login')

	return { provider: pending.provider, suggestedName: pending.suggestedName }
}
