import * as v from 'valibot'

export const loginOrRegisterSchema = v.object({
	username: v.pipe(
		v.string(),
		v.nonEmpty('Please enter your username.'),
		v.minLength(3, 'Username must be at least 3 characters long.'),
		v.maxLength(31, 'Username cannot be longer than 31 characters.'),
		v.regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain alphanumeric characters and underscores.')
	),
	password: v.pipe(
		v.string(),
		v.nonEmpty('Please enter your password.'),
		v.minLength(6, 'Password must be at least 6 characters long.'),
		v.maxLength(255, 'Password cannot be longer than 255 characters.')
	),
	action: v.picklist(['login', 'register'])
})
