import z from 'zod';

const reviewZod = z.object({
    rating: z.number().int().gte(1).lte(5),
    review_text: z.string().max(5000),
})

export { reviewZod };