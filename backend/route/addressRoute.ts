import express from 'express';
import { addressZod } from '../zod/addressZod';
import { IAddress } from '../models/addressModel';
import { authMiddleware } from './middleware';
import { PrismaClient } from '@prisma/client';
import { bookZod } from '../zod/bookZod';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
    try {
        const userMail = req.authEmail;
        const user = await prisma.userinfo.findUnique({
            where: {email: userMail}
        })
        if(!user) {
            return res.status(400).send({message: "Authentication failed"});
        }
        
        const result = addressZod.safeParse(req.body);
        if(result.success) {
            const addressData = {
                ...req.body,
                user_id: user.id,
            }
            const address = await prisma.address.create({
                data: addressData,
            });
            console.log("Created Addess:");
            console.log(address);

            return res.status(201).send(address);
        }
        return res.send(400).send({
            message: "Send required fields for address in proper format",
        });
    }
    catch (error: any) {
        console.log(error.message);
        res.status(500).send({message: error.message});
    }

});

router.get('/', authMiddleware, async (req, res) => {
    try {
        const userMail = req.authEmail;
        const user = await prisma.userinfo.findUnique({
            where: {email: userMail}
        })
        if(!user) {
            return res.status(400).send({message: "Authentication failed"});
        }

        const addresses = await prisma.address.findMany({
            where: {
                user_id: user.id
            }
        });
        return res.status(200).send(addresses);
        
    }
    catch (error: any) {
        console.log(error.message);
        return res.status(500).send({message: error.message});
    }
});

router.put('/:id(\\d+)', authMiddleware, async (req, res) => {
    try {
        const userMail = req.authEmail;
        const user = await prisma.userinfo.findUnique({
            where: {email: userMail}
        })
        if(!user) {
            return res.status(400).send({message: "Authentication failed"});
        }

        const result = addressZod.safeParse(req.body);
        if(result.success) {
            const { id } = req.params;
            const updatedAddress = await prisma.address.update({
                where: { id: Number(id) },
                data: req.body
            });
            if(!updatedAddress) {
                return res.status(401).send({message: `Address with id: ${id} could not be updated`});
            }
            res.status(200).send({message: "Address updated successfully"});
        } 
        else {
            return res.status(400).send({message: "Please send valid data with all required fields."});
        }
    }
    catch (error: any) {
        console.log(error.message);
        return res.status(500).send({message: error.message});
    }
});

router.delete('/:id(\\d+)', authMiddleware, async (req, res) => {
    try {
        const userMail = req.authEmail;
        const user = await prisma.userinfo.findUnique({
            where: {email: userMail}
        })
        if(!user) {
            return res.status(400).send({message: "Authentication failed"});
        }
        const { id } = req.params;
        await prisma.address.delete({
            where: {user_id: user.id, id: Number(id)}
        });
        return res.status(200).send({message: "Address deleted successfully"}) ;   
    }
    catch(error: any) {
        console.log(error.message);
        return res.status(500).send({message: error.message});
    }
})

export default router;