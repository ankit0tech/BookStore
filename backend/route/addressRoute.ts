import express from 'express';
import { addressZod } from '../zod/addressZod';
import { IAddress } from '../models/addressModel';
import { authMiddleware } from './middleware';
import { PrismaClient } from '@prisma/client';

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

            // If we are setting address as default then make other non default
            const address = await prisma.$transaction(async (prisma) => {

                if (req.body.is_default == true) {
                    await prisma.address.updateMany({
                        where: { user_id: user.id },
                        data: { is_default: false },
                    });                
                }
                
                return await prisma.address.create({
                    data: addressData,
                });
            });

            console.log("Address created:");

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

router.get('/:id(\\d+)', authMiddleware, async (req, res) => {
    try {
        const userMail = req.authEmail;
        const { id } = req.params;
        const user = await prisma.userinfo.findUnique({
            where: {email: userMail}
        })
        if(!user) {
            return res.status(400).send({message: "Authentication failed"});
        }

        const address: IAddress | null = await prisma.address.findUnique({
            where: {
                id: Number(id)
            }
        });
        
        return res.status(200).send(address);
        
    }
    catch (error: any) {
        console.log(error.message);
        return res.status(500).send({message: error.message});
    }
});

router.get('/default-address', authMiddleware, async(req, res) => {
    try {
        const userMail = req.authEmail;
        const user = await prisma.userinfo.findUnique({
            where: {email: userMail}
        });
        if(!user) {
            return res.status(400).send({message: "Authentication failed"});
        }

        const address: IAddress | null = await prisma.address.findFirst({
            where: {
                    user_id: user.id,
                    is_default: true
            }
        });

        if (address) {
            return res.status(200).send(address);
        } else {
            return res.status(404).send({ error: "Default address not found" });
        }
    }
    catch (error: any) {
        console.log(error.message);
        return res.status(500).send({message: error.message});
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

        const addresses: Array<IAddress> = await prisma.address.findMany({
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
        const { id } = req.params;
        const user = await prisma.userinfo.findUnique({
            where: {email: userMail}
        })
        if(!user) {
            return res.status(400).send({message: "Authentication failed"});
        }

        const existingAddress = await prisma.address.findUnique({
            where: { id: Number(id) }
        });

        if (!existingAddress) {
            throw new Error(`Address with id: ${id} does not exist`);
        }

        const updatedData = { ...existingAddress, ...req.body };
        const result = addressZod.safeParse(updatedData);

        if(result.success) {
            
            const updatedAddress = await prisma.$transaction(async (prisma) => {
                // If we are setting address as default then make other non default
                if (updatedData.is_default == true) {
                    await prisma.address.updateMany({
                        where: { user_id: user.id },
                        data: { is_default: false },
                    });                
                }

                return await prisma.address.update({
                    where: { id: Number(id) },
                    data: updatedData
                });
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