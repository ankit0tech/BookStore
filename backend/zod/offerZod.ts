import z from 'zod';

const offerZod = z.object({
    discount_percentage: z.number(),
    offer_type: z.string(),
    description: z.string(),
    offer_valid_from: z.string().transform((str) => new Date(str)),// z.date(),
    offer_valid_until: z.string().transform((str) => new Date(str)) // z.date()
});

export {
    offerZod
}