import z from 'zod';

const cartZod = z.object({
    book_id: z.number().int(),
    quantity: z.number().int(),
    selectedOfferId: z.number().optional()
});

export {
    cartZod
}