import { zfd } from 'zod-form-data'
import { z } from 'zod'

export const paymentSchema = zfd.formData({
	id: zfd.numeric().optional(),
	amount: zfd.numeric(z.number({ required_error: 'Amount is required.' })),

	tags: z
		.array(z.string().max(32, 'Some tags are too long, a tag should be 32 characters at most.'))
		.nonempty('A payment must have at least one tag.')
		.or(
			z
				.string()
				.min(1, 'A payment must have at least one tag.')
				.transform((val) => [val])
		)
		.default(''),
	date: z.coerce.date(),
	note: zfd.text(z.optional(z.string().max(256, 'Note should have 256 character or less.')))
})

export const searchParamsSchema = z.object({
	tags: z
		.string()
		.transform((value) => value.split(','))
		.catch([]),
	startDate: z.coerce.date().catch(new Date('01-01-2000')),
	endDate: z.coerce.date().catch(new Date()),
	sortBy: z.enum(['date', 'amount']).catch('date'),
	sortType: z.enum(['desc', 'asc']).catch('desc')
})

export type Payment = Zod.infer<typeof paymentSchema>
export type PaymentFilters = Zod.infer<typeof searchParamsSchema>
