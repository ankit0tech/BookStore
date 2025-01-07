import dotenv from 'dotenv';

dotenv.config();

if(!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environmnet variables');
}

if(!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth credentails are not defined');
}

if(!process.env.DATABASE_URL) {
    throw new Error('Database URL is not present');
}

if(!process.env.SMTP_MAIL || !process.env.SMTP_PASSWORD) {
    throw new Error('SMTP credentails are not provided');
}


export const config = {
    server: {
        port: process.env.PORT || 5555,
        nodeEnv: process.env.NODE_ENV || 'development'
    },
    auth: {
        jwtSecret: process.env.JWT_SECRET,
        adminJwtSecret: process.env.ADMIN_SECRET || '',
        superAdminJwtSecret: process.env.SUPER_ADMIN_SECRET || '',
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        }
    },
    database: {
        url: process.env.DATABASE_URL
    },
    smtp: {
        email: process.env.SMTP_MAIL,
        password: process.env.SMTP_PASSWORD
    }
};
