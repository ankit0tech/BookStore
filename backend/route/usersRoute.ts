import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/userModel';
import { signupZod, signinZod } from '../zod/userZod';
import { JWT_SECRET } from '../config';
import { authMiddleware } from './middleware';

const router = express.Router();

router.post('/singup', async (req, res) => {
    try {
        // if(!req.body.email || !req.body.password) {
        //     return res.status(401).send({message: 'Invalide input'});
        // }

        const result = signupZod.safeParse(req.body);
        if(result.success) {
            const user: IUser = await User.create(req.body);
            console.log('--- USER ---');
            console.log(user);
    
            return res.status(200).send(user);
        }
        return res.status(401).send({message: 'Please send valid inputs'});

    } catch (error: any) {
        console.log(error.message);
        return res.status(500).send({message: error.message});
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

router.post('/signin', async (req, res) => {
    try {
        const result = signinZod.safeParse(req.body);
        if(result.success) {
            const user: IUser|null = await User.findOne({email: req.body.email});

            if (!user) {
                return res.status(401).send({message: 'Please enter valid email'});
            }
            if (user.email === req.body.email && user.password === req.body.password) {
                console.log(user._id?.toString());
                const token = jwt.sign({email: user.email, userId: user._id}, JWT_SECRET);

                return res.status(200).send({toke: token});
            }
        }
        return res.status(401).send({message: 'Please send valid inputs'});
    } catch(error: any) {
        console.log(error.message);
        return res.status(500).send({message: error.message});
    }
})

export default router;
