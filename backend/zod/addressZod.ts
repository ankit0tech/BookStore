import z from 'zod';

const addressZod = z.object({
    street_address: z.string().max(255, 'Street must be atmost 255 characters long'),
    city: z.string().max(255, "City name must be atmost 255 characters long"),
    state: z.string().max(255, "State name must be atmost 255 characters long").optional(),
    zip_code: z.string(),
    country: z.string()
});

export {
    addressZod
}
