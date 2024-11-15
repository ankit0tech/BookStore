import z from 'zod';

const cartZod = z.object({
    bookId: z.number().int(),
    quantity: z.number().int(),
});

export {
    cartZod
}