import z from 'zod';

const urlRegex = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\S*)?$/;

const updateOrderShippingZod = z.object({
    shipping_carrier: z.string().optional(),
    tracking_number: z.string().optional(),
    shipping_label_url: z.union([
        z.string().url({ message: "Invalid URL"}),
        z.string().length(0)
    ]).optional(),
    return_tracking_number: z.string().optional(),
    return_shipping_label_url: z.union([
        z.string().url({ message: "Invalid URL"}),
        z.string().length(0)
    ]).optional()
}).strict();

export { updateOrderShippingZod };