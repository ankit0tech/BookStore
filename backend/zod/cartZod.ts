import z from 'zod';

const cartZod = z.object({
    bookId: z.string(),
    quantity: z.number().int(),
});

export {
    cartZod
}