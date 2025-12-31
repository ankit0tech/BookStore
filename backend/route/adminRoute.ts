import express , {Request, Response }from 'express';
import { authMiddleware, roleMiddleware } from './middleware.js';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { sendVerificationMail } from '../utils/emailUtils.js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { adminSignupZod, signinZod } from '../zod/userZod.js';
import { logger } from '../utils/logger.js';

interface JwtPayload {
    email: string,
    type: string
}

const router = express.Router();
const prisma = new PrismaClient();

// roleMiddleware(['admin', 'superadmin'])
router.post('/generate-admin-signup-token', roleMiddleware(['superadmin']), async (req: Request, res: Response) => {
    try {
        // validate the token before creating admin account
        const { email } = req.body;

        const existingUser = await prisma.userinfo.findUnique({
            where: { 
                email: req.body.email,
                role: 'admin'
            }
        });
        if (existingUser) {
            return res.status(401).json({message: "Admin user already exists, please try with different email"});
        }

        const token = jwt.sign({email: email, type: 'admin_signup'}, config.auth.jwtSecret, {expiresIn: '1h'});
        const subject = 'BookStore admin registeration';
        const message = 'Please use the link below to sinup as admin in BookStore, valid for one hour';
        const signupLink = `${config.frontend.url}/admin/signup?verificationToken=${token}&email=${email}`;

        sendVerificationMail(email, subject, message, signupLink);
        
        return res.status(200).json({message: "Mail sent for new admin signup"});
        
    } catch(error: any) {
        logger.error(error.message);
        return res.status(401).json({message: error.message});
    }
});

router.post('/signup', (req: Request, res: Response) => {
    try {
        const token: string = req.headers.authorization || '';
        if(!adminSignupZod.safeParse(req.body)) {
            return res.status(401).json({ message: "Please send valid inputs" });
        }

        const password: string = req.body.password;

        jwt.verify(token, config.auth.jwtSecret, async (err, decoded) => {
            
            if(err || !decoded) {
                if(err) {
                    logger.info("Error occurred while admin singup: ", err);
                }
                if(!decoded) {
                    logger.info("admin singup token not decoded");
                }
                return res.status(401).json({message: "Access denied"});
            }
            const payload = decoded as JwtPayload;
            if (payload.type != 'admin_signup') {
                return res.status(401).json({message: "Authentication failed, Invalid token"});
            }

            const existingUser = await prisma.userinfo.findUnique({
                where: { email: payload.email }
            });
            if (existingUser) {
                return res.status(401).json({message: "User already exists, please try with different email"});
            }
            
            const encryptedPassword = await bcrypt.hash(password, 10);
            const adminUser = await prisma.userinfo.create({
                data: {
                    email: payload.email,
                    password: encryptedPassword,
                    role: 'admin',
                    verified: true
                }
            });

            logger.info(`Created admin account for: ${adminUser.email}`);
            return res.status(200).json({message: `Admin creation successful ${adminUser.email}`});
        });

    } catch(error: any) {
        logger.error(error.message);
        return res.status(500).json({message: "An unexpected error occurred. Please try again later."});
    }
});


router.post('/signin', async (req: Request, res: Response) => {
    try {
        const result = signinZod.safeParse(req.body);
        if(result.success) {
            
            const user = await prisma.userinfo.findUnique(
                {
                    where: {
                        email: req.body.email
                    }
                }
            )
            
            if (!user || user.provider == 'google' || user.role == 'user' || !user.password || !(await bcrypt.compare(req.body.password, user.password))) {
                return res.status(401).json({message: 'Invalid email or password'});
            }

            
            const token = jwt.sign({email: user.email, userId: user.id, role: user.role, type: 'login'}, config.auth.jwtSecret, {expiresIn: '1h'});
            // req.authEmail = user.email;    // need to decide it later
            logger.info("Admin signed in: ", user.email);
            return res.status(200).json({token: `Bearer ${token}`});
        }
        return res.status(401).json({message: 'Please enter valid inputs'});
    } catch(error: any) {
        logger.error(error.message);
        return res.status(500).json({message: "An unexpected error occurred. Please try again later."});
    }
})


export default router;