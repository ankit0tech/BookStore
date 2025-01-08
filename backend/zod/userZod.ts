import z from 'zod';

const signupZod = z.object({
    email: z.string().email(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    password: z.string().min(6),
});

const adminSignupZod = z.object({
    password: z.string().min(6)
})

const signinZod = z.object({
    email: z.string().email(),
    password: z.string().min(6)
})

export {
    signupZod,
    signinZod,
    adminSignupZod
};