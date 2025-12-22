import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/userModel';
import { signupZod, signinZod } from '../zod/userZod';
import { config } from '../config';
import { authMiddleware } from './middleware';
import { PrismaClient } from "@prisma/client";
import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';
import { sendVerificationMail } from '../utils/emailUtils';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();
const router = express.Router();

interface JwtPayload {
    email: string,
    type: string
}

const passwordResetRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Password reset limit reached, please try again after some time"
});



router.post('/signup', async (req: Request, res: Response) => {
    try {
        // if(!req.body.email || !req.body.password) {
        //     return res.status(401).send({message: 'Invalide input'});
        // }

        const result = signupZod.safeParse(req.body);
        if(result.success) {

            const existingUser = await prisma.userinfo.findUnique({
                where: { email: req.body.email }
            });
            if(existingUser) {
                return res.status(401).json({ message: "Account aleady exists, please try with different email" })
            }

            const password = await bcrypt.hash(req.body.password, 10);
            const user = await prisma.userinfo.create({
                data: {
                    email: req.body.email,
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    password: password,
                    role: 'user'
                }
            });

            logger.info('--- Signing Up user ---');
            logger.info(user);

            const token = jwt.sign({email: user.email, type: 'verification'}, config.auth.jwtSecret, {expiresIn: '1h'});
            const verificationLink = `http://localhost:5555/users/verify-mail?verificationToken=${token}`
            // Action to send verification mail to user
            const message = 'Please verify your mail by clicking on the link below, valid for one hour.';
            const subject = 'BookStore account verification';
            sendVerificationMail(user.email, subject, message, verificationLink);

            return res.status(200).json({message: 'Signup done!'});
        }
        return res.status(401).json({message: 'Please send valid inputs'});

    } catch (error: any) {
        logger.error(error.message);
        return res.status(500).json({message: "An unexpected error occurred. Please try again later."});
    }
})

router.get('/verify-mail', async (req: Request, res: Response) => {

    try {

        const token: string = typeof req.query.verificationToken === 'string' ? req.query.verificationToken : '';

        jwt.verify(token, config.auth.jwtSecret, async (err, decoded) => {
            if (err) {
                logger.error(err);
            }
            if(!decoded) {
                logger.error('Error while decoding token');
            }
    
            if (err || !decoded) {
                return res.status(401).json({ message: 'Authentication failed, Invalid token' })
            }
            const { email, type } = decoded as JwtPayload;
            if (type === 'verification') {
                await prisma.userinfo.update({
                    where: {
                        email: email
                    },
                    data: {
                        verified: true
                    }
                })
                logger.info(`${email} is verified!`);
                return res.status(200).json({message: "your email have been verified!"});
            } else {
                return res.status(401).json({message: "Invalid token"});
            }
        });

    } catch(error: any) {
        logger.error(error.message);
        return res.status(400).json({ message: error.message });
    }


})

router.post('/signin', async (req: Request, res: Response) => {
    try {
        const result = signinZod.safeParse(req.body);        
        if(result.success) {
            // const user: IUser|null = await User.findOne({email: req.body.email});
            const user = await prisma.userinfo.findUnique(
                {
                    where: {
                        email: req.body.email
                    }
                }
            );
            
            if (!user || user.provider == 'google' || !user.password || !(await bcrypt.compare(req.body.password, user.password))) {
                return res.status(401).json({message: 'Invalid email or password'});
            }

            // logger.info(user.id?.toString());
            const token = jwt.sign({email: user.email, userId: user.id, role: user.role, type: 'login'}, config.auth.jwtSecret, {expiresIn: '1h'});
            // req.authEmail = user.email;    // need to decide it later
            // logger.info("User signed in: ", user.email);
            logger.info(`User signed in: ${user.email}`);
            
            return res.status(200).json({token: `Bearer ${token}`});
        }
        return res.status(401).json({message: 'Please enter valid inputs'});
    } catch(error: any) {
        logger.error(error.message);
        return res.status(500).json({message: "An unexpected error occurred. Please try again later."});
    }
})

router.get('/dashboard', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userMail = req.authEmail;
        const user = await prisma.userinfo.findUnique({ 
            where: { email: userMail }
        });

        if (!user) {
            return res.status(400).json({message: "Authentication Issue"});
        } else {
            const { email, first_name, last_name, role } = user;
            const selectedProps = { email, first_name, last_name, role };
            return res.status(200).json({user: selectedProps});
        }
    }
    catch(error: any) {
        logger.error(error.message);
        return res.status(500).json({message: "An unexpected error occurred. Please try again later."});
    }
});

router.post('/reset-password/confirm', passwordResetRateLimit, async (req: Request, res: Response) => {
    try {

        const user = await prisma.userinfo.findUnique({
            where: {
                email: req.body.email,
            }
        });
        
        logger.info(`Sending mail to reset password for ${req.body.email}`);
        
        if (user) {
            const token = jwt.sign({email: user.email, type: 'reset_password'}, config.auth.jwtSecret, {expiresIn: '1h'});
            // const verificationLink = `http://localhost:5173reset-password/verify/${token}`
            const verificationLink = `http://localhost:5173/reset-password/verify?verificationToken=${token}`
            // Action to send verification mail to user
            const message = 'Please click the link below to reset your password, valid for one hour.';
            const subject = 'BookStore password reset';
            sendVerificationMail(user.email, subject, message, verificationLink);
            
            return res.status(200).json({message: "verification mail sent"});
        }

        return res.status(400).json({message: "Error sending reset password mail"});

    } catch (error: any) {
        logger.error(error.message);
        return res.status(500).json({message: "An unexpected error occurred. Please try again later."});
    }
});


router.post('/reset-password/verify', passwordResetRateLimit, async(req: Request, res: Response) => {
    try {
        const token: string = req.body.verificationToken;
        const password: string = req.body.password;

        jwt.verify(token, config.auth.jwtSecret, async (err, decoded) => {
            if (err) {
                logger.error(err);
            }
            if(!decoded) {
                logger.error('Error occurred while verifying token');
            }
            if (err || !decoded) {
                return res.status(401).json({ message: 'Authentication failed, Invalid token' });
            }

            const { email, type } = decoded as JwtPayload;
            if (type === 'reset-password') {
                const hashedPassword = await bcrypt.hash(password, 10);

                const user = await prisma.userinfo.update({
                    where: {
                        email: email
                    },
                    data: {
                        password: hashedPassword
                    }
                });

                if (user) {
                    logger.info(`Password reset done for user: ${user.email}`);
                    return res.status(200).json({message: 'password updated'});
                } else {
                    return res.status(400).json({message: 'Failed to updated password, please try again'});
                }
            } else {
                return res.status(401).json({ message: 'Authentication failed, Invalid token' });
            }
        });
    } catch(error: any) {
        logger.error(error.message);
        return res.status(500).json({message: "An unexpected error occurred. Please try again later."})
    }
});


export default router;
