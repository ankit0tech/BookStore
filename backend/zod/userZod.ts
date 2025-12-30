import z from 'zod';

const signupZod = z.object({
    email: z.string().email(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    password: z.string().min(6),
});

const userUpdateZod = z.object({
    email: z.string().email().optional(),
    first_name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
}).strict();

const adminUserUpdateZod = userUpdateZod.extend({
    role: z.enum(['user', 'admin', 'superadmin']).optional(),
    deactivated: z.boolean().optional(),
}).strict();


const adminSignupZod = z.object({
    password: z.string().min(6)
})

const signinZod = z.object({
    email: z.string().email(),
    password: z.string().min(6)
})

export {
    signupZod,
    userUpdateZod,
    adminUserUpdateZod,
    signinZod,
    adminSignupZod
};