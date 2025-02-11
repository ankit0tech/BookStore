import z from 'zod';

const categoryZod = z.object({
    name: z.string()
});

export {
    categoryZod
}