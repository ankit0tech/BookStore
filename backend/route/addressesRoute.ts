import express from 'express';
import { addressZod } from '../zod/addressZod';
import { authMiddleware } from './middleware';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
    try {

        const result = addressZod.safeParse(req.body);
        if(result.success) {
            const addressData = {
                ...req.body,
                user_id: req.userId,
            }

            // If we are setting address as default then make others non default
            const address = await prisma.$transaction(async (prisma) => {

                if (req.body.is_default == true) {
                    await prisma.address.updateMany({
                        where: { user_id: req.userId },
                        data: { is_default: false },
                    });                
                }
                
                return await prisma.address.create({
                    data: addressData,
                });
            });

            logger.info("Address created:");

            return res.status(201).send(address);
        }
        return res.status(400).json({ message: "Send required fields for address in proper format" });
    }
    catch (error: any) {
        logger.error(error.message);
        res.status(500).json({message: "An unexpected error occurred. Please try again later."});
    }

});

router.get('/:id(\\d+)', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const address = await prisma.address.findUnique({
            where: {
                id: Number(id),
                is_deleted: false
            }
        });
        
        if(address) {
            return res.status(200).send(address);
        } else {
            return res.status(404).json({message: "Address not found"});
        }
        
    }
    catch (error: any) {
        logger.info("Internal server error: ", error.message);
        return res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
    }
});

router.get('/default-address', authMiddleware, async(req, res) => {
    try {

        const address = await prisma.address.findFirst({
            where: {
                    user_id: req.userId,
                    is_default: true,
                    is_deleted: false
            }
        });

        if (address) {
            return res.status(200).send(address);
        } else {
            return res.status(404).json({ error: "Default address not found" });
        }
    }
    catch (error: any) {
        logger.info("Internal server error: ", error.message);
        return res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
    }
});

router.get('/', authMiddleware, async (req, res) => {
    try {

        const addresses = await prisma.address.findMany({
            where: {
                user_id: req.userId,
                is_deleted: false
            },
            orderBy: {
                created_at: 'asc'
            }
        });
        return res.status(200).send(addresses);
        
    }
    catch (error: any) {
        logger.info("Internal server error: ", error.message);
        return res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
    }
});

router.put('/:id(\\d+)', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const existingAddress = await prisma.address.findUnique({
            where: { 
                id: Number(id),
                is_default: false
            }
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
                        where: { user_id: req.userId },
                        data: { is_default: false },
                    });                
                }

                return await prisma.address.update({
                    where: { id: Number(id) },
                    data: updatedData
                });
            });

            if(!updatedAddress) {
                return res.status(404).json({message: `Address with id: ${id} could not be updated`});
            }
            res.status(200).json({message: "Address updated successfully", address: updatedAddress});
        } 
        else {
            return res.status(400).json({message: "Please send valid data with all required fields."});
        }
    }
    catch (error: any) {
        logger.info("Internal server error: ", error.message);
        return res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
    }
});

router.delete('/:id(\\d+)', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const address = await prisma.address.findUnique({
            where: {
                id: Number(id),
                user_id: req.userId
            }
        });

        if(!address) {
            return res.status(404).json({message: "Address not found"});
        }

        const activeOrdersCount = await prisma.orders.count({
            where: {
                address_id: Number(id),
                order_status: {
                    in: ['PENDING', 'PROCESSING', 'OUT_FOR_DELIVERY', 'SHIPPED']
                }
            }
        });

        if(activeOrdersCount == 0) {
            const deletedAddress = await prisma.address.update({
                where: {id: Number(id)},
                data: {
                    is_deleted: true
                }
            });
            
            if (deletedAddress) {
                logger.info(`Address ${id} deleted successfully`);
                return res.status(200).json({message: `Address ${id} deleted successfully`}) ;   
            } else {
                logger.info(`Error occurred while deleting address ${id}`)
                return res.status(400).json({message: "Error occurred while deleting Address"});
            }
        } else {
            logger.info(`Address ${id} can't be deleted. It is being used by active orders.`);
            return res.status(400).json({message: "Address cannot be deleted. It is being used by active orders."});
        }
    } catch(error: any) {
        logger.info("Internal server error: ", error);
        return res.status(500).json({message: "An unexpected error occurred. Please try again later." });
    }
})

export default router;