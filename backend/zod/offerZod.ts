import z, { ZodPromise } from 'zod';

const offerZod = z.object({
    discount_percentage: z.number(),
    offer_type: z.string(),
    description: z.string(),
    offer_valid_from: z.preprocess(
        (str) => (typeof str === 'string' ? new Date(str) : str), 
        z.date()
    ),
    offer_valid_until: z.preprocess(
        (str) => (typeof str === 'string' ? new Date(str) : str), 
        z.date()
    )
});

export {
    offerZod
}