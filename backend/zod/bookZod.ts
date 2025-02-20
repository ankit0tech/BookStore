import z from 'zod';

const urlRegex = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\S*)?$/;

const bookZod = z.object({
    title: z.string(),
    author: z.string(),
    publish_year: z.number(),
    price: z.number(),
    category_id: z.number(),
    cover_image: z.union([
        z.string().regex(urlRegex, { message: "Invalid URL"}),
        z.string().min(0).max(0),
        z.null(),
    ]),
});

export {
    bookZod
};