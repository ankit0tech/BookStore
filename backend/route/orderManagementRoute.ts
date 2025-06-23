import { PrismaClient } from '@prisma/client';
import express from 'express';
import { roleMiddleware } from './middleware';
import { logger } from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();


router.post('/process-cancellation/:id(\\d+)', roleMiddleware(['admin', 'superadmin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { approval } = req.body.approval.toUpperCase();

        const order = await prisma.orders.findUnique({
            where: {
                id: Number(id)
            }
        })
        if(!order) {
            return res.status(404).json({message: 'Order not found'});
        }

        if(approval === 'APPROVED' || approval === 'REJECTED') {
            await prisma.orders.update({
                where: {
                    id: Number(id)
                },
                data: {
                    cancellation_status: approval,
                    cancellation_resolved_at: new Date(),
                    cancellation_processed_by: req.userId
                }
            });
            logger.info(`${id} order approval = ${approval}, by user ${req.userId}`);
            return res.status(200).json({message: `Return request ${approval.toLowerCase()}`});
        } else {
            return res.status(400).json({message: 'Invalid approval for order cancellation'});
        }
    } catch(error: any) {
        logger.error(error.message);
        return res.status(500).json({message: "An unexpected error occurred. Please try again later."})
    }
});

router.post('/process-return/:id(\\d+)', roleMiddleware(['admin', 'superadmin']), async (req, res) => {
    try {
        const { id } = req.params;
        const approval = req.body.approval.toUpperCase();

        const order = await prisma.orders.findUnique({
            where: {
                id: Number(id)
            }
        })
        if(!order) {
            return res.status(404).json({message: 'Order not found'});
        }
        
        if(approval === 'APPROVED' || approval === 'REJECTED') {
            await prisma.orders.update({
                where: {
                    id: Number(id)
                }, 
                data: {
                    return_status: approval,
                    return_processed_by: req.userId
                }
            });

            logger.info(`Return request processed with approval ${approval} by ${req.userId} for order ${id}`);
            return res.status(200).json({message: `Return request ${approval.toLowerCase()}`});
        } else {
            return res.status(400).json({message: 'Invalid approval for order return'});
        }
    } catch(error: any) {
        logger.error(error.message);
        return res.status(500).json({message: 'An unexpected error occurred. Please try again later.'})
    }
});


export default router;