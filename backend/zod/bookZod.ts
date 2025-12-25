import z from 'zod';

const urlRegex = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\S*)?$/;

const createBookZod = z.object({
    title: z.string().min(1, "Title is required"),
    author: z.string().min(1, "Author is required"),
    publish_year: z.number().min(1500, "Invalid year").max(new Date().getFullYear() + 1, "Invalid year"),
    price: z.number().min(0, "Price must be non-negative"),
    category_id: z.number({
        required_error: "Category is required",
        invalid_type_error: "Category must be a number"
    }).min(1, "Category id is invalid"),
    cover_image: z.union([
        z.string().regex(urlRegex, { message: "Invalid URL"}),
        z.string().length(0)
    ]).optional(),


    description: z.string().optional(),
    isbn: z.string().optional(),
    publisher: z.string().optional(),
    language: z.string().optional(),
    pages: z.number().optional(),
    format: z.string().optional(),

    quantity: z.number().optional(),
    is_active: z.boolean().optional(),
    shelf_location: z.string().optional(),
    sku: z.string().optional(),

});


const updateBookZod = createBookZod.partial();

export {
    createBookZod,
    updateBookZod
};