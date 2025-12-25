import { PrismaClient } from '@prisma/client';
import express from 'express';
import { roleMiddleware } from './middleware';
import { logger } from '../utils/logger';
import { updateOrderShippingZod } from '../zod/orderZod';

const router = express.Router();
const prisma = new PrismaClient();

const cancellation_approvals = ['APPROVED', 'REJECTED'];
const return_approvals = ['APPROVED','REJECTED'];
const delivery_status = ['PENDING', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED'];
const payment_status = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']


router.get('/', roleMiddleware(['admin', 'superadmin']), async (req, res) => {
    try {

        const query = req.query.query as string | undefined;
        const orderStatus = req.query.orderStatus as string | undefined;
        const paymentStatus = req.query.paymentStatus as string | undefined;
        const dateOrder : 'asc'|'desc' = req.query.dateOrder === 'asc' ? 'asc' : 'desc';
        const cursor = Number(req.query.nextCursor) || 0;

        let orders;
        let nextCursor;

        orders = await prisma.orders.findMany({
            where: {
                ...(orderStatus && {order_status: orderStatus as any}),
                ...(paymentStatus && {payment_status: paymentStatus as any}),
                ...(query && {
                    OR: [
                        {
                            order_number: {
                                contains: query,
                                mode: 'insensitive'
                            }
                        },
                        {
                            user: {
                                OR: [
                                    {
                                        email: {
                                            contains: query,
                                            mode: 'insensitive'
                                        }
                                    },
                                    {
                                        first_name: {
                                            contains: query,
                                            mode: 'insensitive'
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            order_items: {
                                some: {
                                    book: {
                                        OR: [
                                            {
                                                title: {
                                                    contains: query,
                                                    mode: 'insensitive'
                                                }
                                            },
                                            {
                                                author: {
                                                    contains: query,
                                                    mode: 'insensitive'
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    ]
                })
            },
            include: {
                order_items: {
                    include: {
                        book: true,
                        special_offer: true,
                    }
                },
                address: true,
                user: true
            },
            take: 11,
            orderBy: [
                { created_at: dateOrder },
                { id: 'asc' }
            ],
            cursor: cursor ? { id: cursor } : undefined,
        });

        if(orders.length > 10) {
            nextCursor = orders[orders.length - 1].id;
            orders.pop();
        }

        return res.status(200).json({count: orders.length, data: orders, nextCursor: nextCursor});

    } catch (error: any) {
        logger.error(error.message);
        return res.status(500).json({message: "An unexpected error occurred. Please try again later."})
    }
});

router.post('/update/:id(\\d+)', roleMiddleware(['admin', 'superadmin']), async (req, res) => {
    try {
        const { id } = req.params;
        const optionName = req.body.optionName;
        const optionValue = req.body.optionValue.toUpperCase();

        const order = await prisma.orders.findUnique({
            where: {
                id: Number(id)
            }
        })
        if(!order) {
            return res.status(404).json({message: 'Order not found'});
        }

        if(optionName === 'cancellation') {
            if(cancellation_approvals.includes(optionValue)) {
                await prisma.orders.update({
                    where: {
                        id: Number(id)
                    },
                    data: {
                        cancellation_status: optionValue,
                        cancellation_resolved_at: new Date(),
                        cancellation_processed_by: req.userId
                    }
                });

                logger.info(`${id} order ${optionName} status updated to ${optionValue}, by user ${req.userId}`);
                return res.status(200).json({message: `${optionName} status updated to ${optionValue}`});
            } else {
                return res.status(400).json({message: `Invalid update value for order ${optionName}`});
            }
        } else if (optionName === 'return') {
            if(return_approvals.includes(optionValue)) {
                await prisma.orders.update({
                    where: {
                        id: Number(id)
                    },
                    data: {
                        return_status: optionValue,
                        return_resolved_at: new Date(),
                        return_processed_by: req.userId
                    }
                });
                
                logger.info(`${id} order ${optionName} status updated to ${optionValue}, by user ${req.userId}`);
                return res.status(200).json({message: `${optionName} status updated to ${optionValue}`});
            } else {
                return res.status(400).json({message: `Invalid update value for order ${optionName}`});
            }
        } else if (optionName === 'delivery') {
            if(delivery_status.includes(optionValue)) {
                await prisma.orders.update({
                    where: {
                        id: Number(id)
                    },
                    data: {
                        order_status: optionValue,
                        actual_delivery_date: optionValue === 'DELIVERED' ? new Date() : null
                    }
                });
                
                logger.info(`${id} order ${optionName} status updated to ${optionValue}, by user ${req.userId}`);
                return res.status(200).json({message: `${optionName} status updated to ${optionValue}`}); 
            } else {
                return res.status(400).json({message: `Invalid update value for order ${optionName}`});
            }
        } else if (optionName === 'payment') {
            if(payment_status.includes(optionValue)) {
                await prisma.orders.update({
                    where: {
                        id: Number(id)
                    },
                    data: {
                        payment_status: optionValue,
                    }
                });
                
                logger.info(`${id} order ${optionName} status updated to ${optionValue}, by user ${req.userId}`);
                return res.status(200).json({message: `${optionName} status updated to ${optionValue}`}); 
            } else {
                return res.status(400).json({message: `Invalid update value for order ${optionName}`});
            }
        } else {
            return res.status(400).json({message: 'Invalid option'});
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
        });
        if(!order) {
            return res.status(404).json({message: 'Order not found'});
        }
        
        if(approval in return_approvals) {
            await prisma.orders.update({
                where: {
                    id: Number(id)
                }, 
                data: {
                    return_status: approval,
                    return_resolved_at: new Date(),
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

router.put('/update-shipping-details/:id(\\d+)', roleMiddleware(['admin', 'superadmin']), async (req, res) => {
    try {

        const { id } = req.params;
        const result = updateOrderShippingZod.safeParse(req.body);
        console.log(req.body);

        if(result.success) {
            const order = await prisma.orders.update({
                where: {
                    id: Number(id)
                },
                data: result.data,
                include: {
                    order_items: {
                        include: {
                            book: true,
                            special_offer: true
                        }
                    },
                    address: true,
                    user: true
                }
            });

            logger.info(`Shipping details update for ${id} by user ${req.userId}`);
            return res.status(200).json({
                message: "Updated order successfully",
                data: order
            });

        } else {
            return res.status(400).json({
                message: "Please send valid data for all required fields",
                error: result.error.format()
            });
        }
    } catch (error: any) {
        if(error.code === 'P2025') {
            return res.status(404).json({message: "Order not found"});
        }
        logger.error(error.message);
        return res.status(500).json({message: "An unexpected error occurred. please try again later"});
    }
});

export default router;