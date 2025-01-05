import express , {Request, Response }from 'express';
import { authMiddleware, roleMiddleware } from './middleware';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { sendVerificationMail } from '../utils/emailUtils';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { signupZod } from '../zod/userZod';

interface JwtPayload {
    email: string,
    type: string
}

const router = express.Router();
const prisma = new PrismaClient();

// roleMiddleware(['admin', 'superadmin'])
router.post('/generate-admin-signup-token', roleMiddleware(['superadmin']), (req: Request, res: Response) => {
    try {
        // validate the token before creating admin account
        const { email } = req.body;
        
        const token = jwt.sign({email: email, type: 'admin_signup'}, config.auth.adminJwtSecret, {expiresIn: '1h'});
        const subject = 'BookStore admin registeration';
        const message = 'Please use the link below to sinup as admin in BookStore, valid for one hour';
        const signupLink = `http://localhost:5555/admin/signup?verificationToken=${token}`;

        sendVerificationMail(email, subject, message, signupLink);
        
        return res.status(200).json({message: "Mail sent for new admin signup"});
    } catch(error: any) {
        console.log(error.message);
        return res.status(401).json({message: error.message});
    }
});

router.post('/signup', (req: Request, res: Response) => {
    try {
        const token: string = req.headers.authorization || '';
        if(!signupZod.safeParse(req.body)) {
            return res.status(401).json({ message: "Please send valid inputs" });
        }

        const email: string = req.body.email;
        const password: string = req.body.password;

        jwt.verify(token, config.auth.adminJwtSecret, async (err, decoded) => {
            
            if(err || !decoded) {
                if(err) {
                    console.log("Error occured while admin singup: ", err);
                }
                if(!decoded) {
                    console.log("admin singup token not decoded");
                }
                return res.status(401).json({message: "Access denied"});
            }
            const payload = decoded as JwtPayload;
            if (email !== payload.email || payload.type != 'admin_signup') {
                return res.status(401).json({message: "Email mismatch. Please try again with correct email"});
            }
            
            const encryptedPassword = await bcrypt.hash(password, 10);
            const adminUser = await prisma.userinfo.create({
                data: {
                    email: email,
                    password: encryptedPassword,
                    role: 'admin',
                    verified: true
                }
            });

            console.log(`Created admin account for: ${adminUser.email}`);
            return res.status(200).json({message: `Admin creation successful ${adminUser.email}`});
        });

    } catch(error: any) {
        console.log(error.message);
        return res.status(500).json({message: error.message});
    }
});

export default router;