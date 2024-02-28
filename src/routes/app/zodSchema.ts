import { zfd } from 'zod-form-data'
import { z } from 'zod'

export const paymentSchema = zfd.formData({
	amount: zfd.numeric(z.number({ required_error: 'Amount is required.' })),
	tags: z.array(z.string().max(32)).or(z.string().max(32)),
	date: z.coerce.date(),
	note: zfd.text(z.optional(z.string().max(256, 'Note should have 256 character or less.')))
})
