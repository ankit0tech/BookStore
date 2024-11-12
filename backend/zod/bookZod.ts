import z from 'zod';

const bookZod = z.object({
    title: z.string(),
    author: z.string(),
    publishYear: z.number(),
    price: z.number(),
    category: z.string(),
});

export {
    bookZod
};