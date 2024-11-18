import z from 'zod';

const bookZod = z.object({
    title: z.string(),
    author: z.string(),
    publish_year: z.number(),
    price: z.number(),
    category: z.string(),
});

export {
    bookZod
};