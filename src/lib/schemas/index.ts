import * as v from 'valibot'

// Tag create/update. Submitted via a remote `form()`, so every field is a string
// from FormData. An empty `id` means "create"; a present `id` means "update". The
// handler coerces `id`/`budget` to numbers so the form-field types stay plain strings.
export const tagUpsertSchema = v.object({
	id: v.optional(v.string(), ''),
	name: v.pipe(v.string(), v.trim(), v.minLength(1, 'Give the tag a name.'), v.maxLength(255)),
	color: v.pipe(v.string(), v.minLength(1)),
	icon: v.pipe(v.string(), v.minLength(1)),
	budget: v.optional(v.string(), '')
})

export const usernameSchema = v.pipe(
	v.string(),
	v.nonEmpty('Please enter your username.'),
	v.minLength(3, 'Username must be at least 3 characters long.'),
	v.maxLength(31, 'Username cannot be longer than 31 characters.'),
	v.regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain alphanumeric characters and underscores.')
)

// Picking a username after a first-time OAuth sign-in.
export const chooseUsernameSchema = v.object({
	username: usernameSchema
})

export const loginOrRegisterSchema = v.object({
	username: usernameSchema,
	password: v.pipe(
		v.string(),
		v.nonEmpty('Please enter your password.'),
		v.minLength(6, 'Password must be at least 6 characters long.'),
		v.maxLength(255, 'Password cannot be longer than 255 characters.')
	),
	action: v.picklist(['login', 'register'])
})
