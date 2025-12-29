import z from 'zod';

const signupZod = z.object({
    email: z.string().email(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    password: z.string().min(6),
});

// allow user to update themselves
const userUpdateZod = z.object({
    email: z.string().email().optional(),
    first_name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    googleId: z.string().optional(),
    provider: z.string().optional(),
    role: z.enum(['user', 'admin', 'superadmin']).optional(),
    deactivated: z.boolean().optional(),
});

// allow admin/superadmin to update users
// const adminUserUpdateZod = z.object({});


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
    signinZod,
    adminSignupZod
};