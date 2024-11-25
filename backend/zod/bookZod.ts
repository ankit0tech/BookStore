import z from 'zod';

const bookZod = z.object({
    title: z.string(),
    author: z.string(),
    publish_year: z.number(),
    price: z.number(),
    category: z.string(),
    cover_image: z.union([
        z.string().url({ message: "Invalid URL"}),
        z.string().min(0).max(0),
        z.null(),
    ]),
});

export {
    bookZod
};