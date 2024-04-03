import { redirect } from '@sveltejs/kit'

export const load = ({ locals }) => {
	if (locals.session) throw redirect(303, '/app')
}
