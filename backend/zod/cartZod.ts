import z from 'zod';

const cartZod = z.object({
    book_id: z.number().int(),
    quantity: z.number().int(),
    selectedOfferId: z.number().optional()
});

const checkoutZod = z.object({
    delivery_address_id: z.number().int(),
});

export {
    cartZod,
    checkoutZod
}