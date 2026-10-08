import { defineEnvVars } from '@sveltejs/kit/env'
import { building } from '$app/env'
import * as v from 'valibot'

const optional = v.optional(v.string())

export const variables = defineEnvVars({
	DATABASE_URL: { schema: building ? optional : v.pipe(v.string(), v.nonEmpty()) },
	AUTH_SECRET: { schema: optional, description: 'Signs the OAuth state cookie' },
	GOOGLE_CLIENT_ID: { schema: optional },
	GOOGLE_CLIENT_SECRET: { schema: optional },
	GITHUB_CLIENT_ID: { schema: optional },
	GITHUB_CLIENT_SECRET: { schema: optional }
})
