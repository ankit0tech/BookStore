import z from 'zod';

const categoryZod = z.object({
    title: z.string(),
    parent_id: z.number().nullable().optional()
});

export {
    categoryZod
}