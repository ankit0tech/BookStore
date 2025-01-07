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
            const password = await bcrypt.hash(req.body.password, 10);
            req.body.password = password

            const user = await prisma.userinfo.create(
                {
                    data: req.body
                }
            )
            console.log('--- Signing Up user ---');
            console.log(user);

            const token = jwt.sign({email: user.email, type: 'verification'}, config.auth.jwtSecret, {expiresIn: '1h'});
            const verificationLink = `http://localhost:5555/users/verify-mail?verificationToken=${token}`
            // Action to send verification mail to user
            const message = 'Please verify your mail by clicking on the link below, valid for one hour.';
            const subject = 'BookStore account verification';
            sendVerificationMail(user.email, subject, message, verificationLink);

            return res.status(200).send({message: 'Signup done!'});
        }
        return res.status(401).send({message: 'Please send valid inputs'});

    } catch (error: any) {
        console.log(error.message);
        return res.status(500).send({message: error.message});
    }
})

router.get('/verify-mail', async (req: Request, res: Response) => {

    try {

        const token: string = typeof req.query.verificationToken === 'string' ? req.query.verificationToken : '';

        jwt.verify(token, config.auth.jwtSecret, async (err, decoded) => {
            if (err) {
                console.log('ERROR OCCURRED')
                console.log(err);
            }
            if(!decoded) {
                console.log('not decoded');
            }
    
            if (err || !decoded) {
                return res.status(401).send({ message: 'Authentication failed, Invalid token' })
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
                console.log(`${email} is verified!`);
                return res.status(200).send({message: "your email have been verified!"});
            } else {
                return res.status(401).send({message: "Invalid token"});
            }
        });

    } catch(error: any) {
        console.log(error.message);
        return res.status(400).json({ message: error.message });
    }


})

router.get('/access', authMiddleware,  async (req: Request, res: Response) => {
    // console.log("Auth Email:", req.authEmail);
    return res.status(200).send('Access is granted to you');

    // const token = req.headers.authorization;

    // if(!token) {
    //     return res.status(401).send('Please send Auth Token');
    // }

    // jwt.verify(token, JWT_SECRET, (err, decoded) => {
    //     if (err) {
    //         return res.status(401).send('JWT verification failed');
    //     }
    //     else{
    //         return res.status(200).send('Access is granted to you');
    //     }
    // })
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
            )
            
            if (!user || user.provider == 'google' || !user.password || !(await bcrypt.compare(req.body.password, user.password))) {
                return res.status(401).send({message: 'Invalid email or password'});
            }

            // console.log(user.id?.toString());
            const token = jwt.sign({email: user.email, userId: user.id, role: user.role, type: 'login'}, config.auth.jwtSecret, {expiresIn: '1h'});
            // req.authEmail = user.email;    // need to decide it later
            console.log("User signed in: ", user.email);
            
            return res.status(200).send({token: token});
        }
        return res.status(401).send({message: 'Please enter valid inputs'});
    } catch(error: any) {
        console.log(error.message);
        return res.status(500).send({message: error.message});
    }
})

router.get('/profile', authMiddleware, async (req: Request, res: Response) => {
    try {
        const userMail = req.authEmail;
        const user = await prisma.userinfo.findUnique({ 
            where:{email: userMail}
        });
        if (!user) {
            return res.status(400).send({message: "Authentication Issue"});
        }
        else {
            const { email, first_name, last_name, role } = user;
            const selectedProps = { email, first_name, last_name, role };
            return res.status(200).send({user: selectedProps});
        }
    }
    catch(error: any) {
        console.log(error.message);
        return res.status(500).send({message: error.message});
    }
});

router.post('/reset-password/confirm', passwordResetRateLimit, async (req: Request, res: Response) => {
    try {

        const user = await prisma.userinfo.findUnique({
            where: {
                email: req.body.email,
            }
        });
        console.log(`Sending mail to reset password for ${req.body.email}`);
        
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
        console.log(error.message);
        return res.status(500).json({message: error.message});
    }
});


router.post('/reset-password/verify', passwordResetRateLimit, async(req: Request, res: Response) => {
    try {
        const token: string = req.body.verificationToken;
        const password: string = req.body.password;

        jwt.verify(token, config.auth.jwtSecret, async (err, decoded) => {
            if (err) {
                console.log('ERROR OCCURRED')
                console.log(err);
            }
            if(!decoded) {
                console.log('not decoded');
            }
            if (err || !decoded) {
                return res.status(401).json({ message: 'Authentication failed, Invalid token' });
            }

            const { email } = decoded as JwtPayload;
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
                console.log(`Password reset done for user: ${user.email}`);
                return res.status(200).json({message: 'password updated'});
            } else {
                return res.status(400).json({message: 'Failed to updated password, please try again'});
            }
        });
    } catch(error: any) {
        console.log(error.message);
        return res.status(500).json({message: error.message})
    }
});


export default router;
