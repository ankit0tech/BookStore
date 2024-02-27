import z from 'zod';

const signupZod = z.object({
    email: z.string().email(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    password: z.string().min(6)
});

const signinZod = z.object({
    email: z.string().email(),
    password: z.string().min(6)
})

export {
    signupZod,
    signinZod
};