import express from 'express';
import { User } from '../models/userModel.js';
import { signupZod, signinZod } from '../zod/userZod.js';

const router = express.Router();

router.post('/singup', async (req, res) => {
    try {
        // if(!req.body.email || !req.body.password) {
        //     return res.status(401).send({message: 'Invalide input'});
        // }

        const result = signupZod.safeParse(req.body);
        if(result.success) {
            const user = await User.create(req.body);
            return res.status(200).send(user);
        }
        return res.status(401).send({message: 'Please send valid inputs'});

    } catch (error) {
        console.log(error.message);
        return res.status(500).send({message: error.message});
    }
})


export default router;
