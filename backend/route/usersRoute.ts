import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/userModel';
import { signupZod, signinZod } from '../zod/userZod';
import { JWT_SECRET } from '../config';
import { authMiddleware } from './middleware';
import { PrismaClient } from "@prisma/client";
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();
const router = express.Router();

interface JwtPayload {
    email: string,
    userId: string,
    type: string
}


const sendVerificationMail = (userMail: string, verificationLink: string): void => {
    const senderMail: string|undefined = process.env.SMTP_MAIL
    const senderPassword: string|undefined = process.env.SMTP_PASSWORD
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: senderMail,
            pass: senderPassword,
        }
    });
    
    transporter.sendMail({
        from: `"Ankit Punia" <${senderMail}>`,
        to: userMail,
        subject: 'Account Verification BookStore',
        text: `Hi, ${senderMail} \nPlease verify your mail by clicking on the link below, valid for one hour. \n${verificationLink}\nRegards,\nBookStore Team`,
    }, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId)
    });
    
}

router.post('/signup', async (req: Request, res: Response) => {
    try {
        // if(!req.body.email || !req.body.password) {
        //     return res.status(401).send({message: 'Invalide input'});
        // }

        const result = signupZod.safeParse(req.body);
        if(result.success) {
            const user = await prisma.userinfo.create(
                {
                    data: req.body
                }
            )
            console.log('--- Signing Up user ---');
            console.log(user);

            const token = jwt.sign({email: user.email, userId: user.id, role: user.role, type: 'verification'}, JWT_SECRET, {expiresIn: '1h'});
            const verificationLink = `http://localhost:5555/users/verify-mail?verificationToken=${token}`
            // Action to send verification mail to user
            sendVerificationMail(user.email, verificationLink)

            return res.status(200).send(user);
        }
        return res.status(401).send({message: 'Please send valid inputs'});

    } catch (error: any) {
        console.log(error.message);
        return res.status(500).send({message: error.message});
    }
})

router.get('/verify-mail', async (req: Request, res: Response) => {
    const token: string = typeof req.query.verificationToken === 'string' ? req.query.verificationToken : '';

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
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
        const { userId, email, type } = decoded as JwtPayload;
        if (type === 'verification') {
            await prisma.userinfo.update({
                where: {
                    id: Number(userId)
                },
                data: {
                    verified: true
                }
            })
        }
        console.log(`${email} is verified!`);
        res.status(200).send({message: "your email have been verified!"});
    })
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

            if (!user) {
                return res.status(401).send({message: 'Please enter valid email'});
            }
            if (user.email === req.body.email && user.password === req.body.password) {
                // console.log(user.id?.toString());
                const token = jwt.sign({email: user.email, userId: user.id, role: user.role, type: 'login'}, JWT_SECRET, {expiresIn: '1h'});
                // req.authEmail = user.email;    // need to decide it later
                console.log("User singed in: ", user.email);
                return res.status(200).send({token: token});
            }
        }
        return res.status(401).send({message: 'Please send valid inputs'});
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


export default router;
