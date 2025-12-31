import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from './middleware.js';
import { logger } from '../utils/logger.js';
import { checkoutZod } from '../zod/cartZod.js';
import { generateOrderNumber, calculateDeliveryCharges } from '../utils/orderUtils.js';
import { config } from '../config.js';
import Razorpay from 'razorpay';
import { validateWebhookSignature } from 'razorpay/dist/utils/razorpay-utils';

const router = express.Router();
const prisma = new PrismaClient();


const isCancellable = (purchaseDate: Date, hours: number): boolean => {
    purchaseDate.setHours(purchaseDate.getHours() + hours)
    return purchaseDate > new Date();
}

const isReturnable = (purchaseDate: Date, days: number): boolean => {
    purchaseDate.setDate(purchaseDate.getDate() + days);
    return purchaseDate > new Date();
}


// checkout
router.post('/checkout', authMiddleware, async (req, res) => {
    // take the user
    // take all the un-purchased items for the user and move them to purchased state

    try {
        logger.info("chekcout...");
        const result = checkoutZod.safeParse(req.body);

        const razorpay = new Razorpay({ 
            key_id: config.razorpay.key_id, 
            key_secret: config.razorpay.key_secret
        });
        const userId = req.userId;
        
        if (result.success) {
            if(userId) {
                // check if req.body.delivery_address_id is valid
                const cartItems = await prisma.cart.findMany({
                    where: {
                        user_id: userId
                    },
                    include: {
                        book: true,
                        special_offer: true
                    }
                });
                
                if (cartItems.length === 0) {
                    return res.status(400).json({message: "Cart is empty"});
                }
                
                // const purchase_price = item.special_offer ? item.book.price * (100 - item.special_offer.discount_percentage) / 100 : item.book.price;
                const subtotal = cartItems.reduce((acc, current) => {
                    const {book, quantity, special_offer} = current;
                    const discount = special_offer ? special_offer.discount_percentage : 0;
                    const discountedPrice = book.price * (100-discount) / 100;
                    return acc + (quantity * discountedPrice);
                }, 0);
                
                // const delivery_charges = req.body.delivery_charges || 0;
                const delivery_charges = calculateDeliveryCharges(subtotal, req.body.delivery_method.toUpperCase());
                const total_amount =  subtotal + delivery_charges;
                const orderNumber = generateOrderNumber();
                
                let razorpayOrder;
                try {

                    const options = {
                        amount: total_amount,
                        currency: "INR",
                        receipt: orderNumber
                    };
    
                    razorpayOrder = await razorpay.orders.create(options);

                } catch (error: any) {
                    logger.error("Razorpay order creation failed: " + error);
                    return res.status(400).json({ message: "Payment gateway error" });
                }

                await prisma.$transaction(async (prisma) => {
                    const order = await prisma.orders.create({
                        data: {
                            user_id: userId,
                            address_id: req.body.delivery_address_id,
                            order_number: orderNumber,
                            razorpay_order_id: razorpayOrder.id,
                            delivery_charges: delivery_charges,
                            subtotal: subtotal,
                            total_amount: total_amount,
                            delivery_method: req.body.delivery_method.toUpperCase() || 'STANDARD',
                            expected_delivery_date: new Date(Date.now() + (7*24*60*60*1000))
                        }
                    });

                    const orderItemsPromises = cartItems.map(item => {
                        const unit_price = item.special_offer ? item.book.price * (100 - item.special_offer.discount_percentage) / 100 : item.book.price;
                        return prisma.order_items.create({
                            data: {
                                book_id: item.book.id,
                                order_id: order.id,
                                quantity: item.quantity,
                                unit_price: unit_price,
                                offer_id: item.special_offer && item.special_offer.id
                            }
                        });
                    });
                    await Promise.all(orderItemsPromises);
                    
                    const updateBookPromises = cartItems.map((item) => (
                        prisma.book.update({
                            where: { id: item.book_id },
                            data: {
                                purchase_count: { increment: item.quantity }
                            }
                        }))
                    );
                    await Promise.all(updateBookPromises);  // run all promises in parallel
                });
                        
                return res.status(200).send({
                    message: "Checked out. All cart Items are purchased",
                    razorpayOrder: razorpayOrder
                });
            } else {
                    return res.status(400).send({message: "Issue with your login"});
            }
        } else {
            return res.status(400).send({message: "Invalid inputs", errors: result.error.format()});
        }
    }
    catch (error: any) {
        logger.error(error);
        return res.status(500).send({message: "An unexpected error occurred. Please try again later."});
    }
});

router.post('/verify-payment', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        if(!userId) {
            return res.status(401).json({message: 'Authentcation failed'});
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const order = await prisma.orders.findUnique({
            where: {
                razorpay_order_id: razorpay_order_id
            }, select: {
                razorpay_payment_id: true,
                razorpay_signature: true
            }
        });

        if(order?.razorpay_payment_id) {
            logger.error(`Repeated /verify-payment request for razorpay_order_id ${razorpay_order_id}`);
            return res.status(409).json({message: 'Repeated request'});
        }
        
        const razorpay_secret = config.razorpay.key_secret || "";
        const isValidSignature = validateWebhookSignature(razorpay_order_id + '|' + razorpay_payment_id, razorpay_signature, razorpay_secret);
        
        if(isValidSignature) {
            await prisma.cart.deleteMany({ where: { user_id: userId } });
            await prisma.orders.update({
                where: {
                    razorpay_order_id: razorpay_order_id
                },
                data: {
                    payment_status: "COMPLETED",
                    order_status: "PENDING",
                    razorpay_payment_id: razorpay_payment_id,
                    razorpay_signature: razorpay_signature
                }
            });

            logger.info(`Payment verified for order ${razorpay_order_id}`);
            return res.status(200).json({message: `Payment verified for order ${razorpay_order_id}`});

        } else {
            await prisma.orders.update({
                where: {
                    razorpay_order_id: razorpay_order_id
                },
                data: {
                    payment_status: "FAILED",
                    order_status: "FAILED"
                }
            });

            logger.error("Payment verification failed");
            return res.status(400).json({message: "Payment verification failed"});
        }
    } catch (error: any) {
        logger.error(error);
        return res.status(500).send({message: "An unexpected error occurred. Please try again later."});
    }
});

router.post('/payment-failure', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        if(!userId) {
            return res.status(400).json({message: "Authentication failed"});
        }

        const { razorpay_order_id, error } = req.body;
        if(!razorpay_order_id) {
            return res.status(400).json({message: "razorpay_order_id is required"});
        }

        const order = await prisma.orders.findUnique({
            where: {
                razorpay_order_id: razorpay_order_id,
                user_id: userId
            }
        });

        if(!order) {
            return res.status(400).json({message: "Order not found"});
        }

        if(order.payment_status === 'PENDING') {
            await prisma.orders.update({
                where: {
                    razorpay_order_id: razorpay_order_id,
                    user_id: userId
                },
                data: {
                    payment_status: 'FAILED',
                    order_status: 'FAILED'
                }
            });
            logger.info(`Payment failed for ${razorpay_order_id} : ${error?.description || 'Unknown error'}`);
            return res.status(200).json({message: "Payment failure recorded"});
        } else {
            logger.info(`Not able to mark payment to failed for order ${razorpay_order_id}, as it is already processed`);
            return res.status(200).json({message: "Payment already processed for the order"});
        }

    } catch (error: any) {
        logger.error(error);
        return res.status(500).send({message: "An unexpected error occurred. Please try again later."});
    }
});

// retrieve current user purchased items 
router.get('/get-purchased-items', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const query = req.query.query as string | undefined;
        const orderStatus = req.query.orderStatus as string | undefined;
        const paymentStatus = req.query.paymentStatus as string | undefined;
        const dateOrder : 'asc'|'desc' = req.query.dateOrder === 'asc' ? 'asc' : 'desc';

        if(userId) {
            const purchasedItems = await prisma.orders.findMany({
                where: { 
                    user_id: userId,
                    ...(orderStatus && {order_status: orderStatus as any}),
                    ...(paymentStatus && {payment_status: paymentStatus as any}),
                    ...(query && {
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
                    })
                }, 
                include: {
                    order_items: {
                        include: {
                            book: true,
                            special_offer: true
                        }
                    },
                    address: true
                },
                orderBy: {
                    created_at: dateOrder
                }
            });

            return res.status(200).send({ data: purchasedItems });
        } else {
            return res.status(400).send({message: "Issue with your login"});
        }
    }
    catch (error: any) {
        logger.error(error.message);
        return res.status(500).send({message: "An unexpected error occurred. Please try again later."});
    }
});

router.get('/order-details/:id(\\d+)', authMiddleware, async (req, res) =>{
    try {
        const { id } = req.params;
        const userId = req.userId; 
        
        if(userId) {
            const orderDetails = await prisma.orders.findUnique({
                where: { 
                    user_id: userId,
                    id: Number(id)
                }, 
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

            return res.status(200).send({ data: orderDetails });
        } else {
            return res.status(400).send({message: "Issue with your login"});
        } 
    } catch(error: any) {
        logger.error(error.message);
        return res.status(500).send({message: "An unexpected error occurred. Please try again later."});
    }
});

router.post('/request-cancellation/:id(\\d+)', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.orders.findUnique({
            where: {
                id: Number(id)
            }, 
            include: {
                order_items: {
                    include: {
                        book: true
                    }
                }
            }
        });

        if(order) {
            const canCancel = order.order_items.every((item) => item.book.is_cancellable && isCancellable(order.purchase_date, item.book.cancellation_hours));
            if(canCancel) {
                await prisma.orders.update({
                    where: {
                        id: Number(id),
                    },
                    data: {
                        cancellation_status: 'REQUESTED',
                        cancellation_reason: req.body.reason || 'User requested cancellation',
                        cancellation_requested_at: new Date()
                    }
                });

                logger.info(`Cancellation requested for order ${id} by user ${req.userId}`);
                return res.status(200).json({message: "Cancellation requested successfully"});
            } else {
                return res.status(400).json({message: "Order cannot be cancelled"});
            }
        } else {
            return res.status(404).json({ message: "Order not found"});
        }
    } catch (error: any) {
        logger.error(error.message);
        return res.status(500).json({message: "An unexpected error occurred. Please try again later."});
    }
});

router.post('/request-return/:id(\\d+)', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.orders.findUnique({
            where: {
                id: Number(id)
            }, 
            include: {
                order_items: {
                    include: {
                        book: true
                    }
                }
            }
        });

        if(order) {
            const canReturn = order.order_items.every((item) => item.book.is_returnable && isReturnable(order.purchase_date, item.book.return_days));
            if(canReturn && order.cancellation_status != 'APPROVED' && order.cancellation_status != 'REQUESTED') {
                await prisma.orders.update({
                    where: {
                        id: Number(id)
                    },
                    data: {
                        return_status: 'REQUESTED',
                        return_reason: req.body.reason || 'User requested return',
                        return_requested_at: new Date(),
                    }
                });

                logger.info(`Return requested for order ${id} by user ${req.userId}`);
                return res.status(200).json({message: 'Return requested'});
            } else {
                return res.status(400).json({message: 'Order cannot be returned'});
            }
        } else {
            return res.status(404).json({ message: 'Order not found'});
        }
    } catch(error: any) {
        logger.error(error.massage);
        return res.status(400).json({message: "An unexpected error occurred. Please try again later."});
    }
});

export default router;