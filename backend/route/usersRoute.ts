import express from 'express';
import { User, IUser } from '../models/userModel';
import { signupZod, signinZod } from '../zod/userZod';

const router = express.Router();

router.post('/singup', async (req, res) => {
    try {
        // if(!req.body.email || !req.body.password) {
        //     return res.status(401).send({message: 'Invalide input'});
        // }

        const result = signupZod.safeParse(req.body);
        if(result.success) {
            const user: IUser = await User.create(req.body);
            return res.status(200).send(user);
        }
        return res.status(401).send({message: 'Please send valid inputs'});

    } catch (error: any) {
        console.log(error.message);
        return res.status(500).send({message: error.message});
    }
})


export default router;
