import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from './middleware';
import { logger } from '../utils/logger';
import { checkoutZod } from '../zod/cartZod';
import { generateOrderNumber } from '../utils/orderUtils';

const router = express.Router();
const prisma = new PrismaClient();


const isCancellable = (purchaseDate: Date, hours: number): boolean => {
    purchaseDate.setHours(purchaseDate.getHours() + hours);
    return purchaseDate > new Date();
}

const isReturnable = (purchaseDate: Date, days: number): boolean => {
    purchaseDate.setDate(purchaseDate.getDate() + days);
    return purchaseDate > new Date();
}

// checkout
router.post('/checkout', authMiddleware, async (req, res) =>{
    // take the user
    // take all the un-purchased items for the user and move them to purchased state

    try {
        logger.info("chekcout...");
        console.log("BODY: ", req.body);
        const result = checkoutZod.safeParse(req.body);
        
        if (result.success) {
            const userEmail = req.authEmail;
            const user = await prisma.userinfo.findUnique({
                where: {email: userEmail}
            });
            // check if req.body.delivery_address_id is valid

            if (user) {
                await prisma.$transaction(async (prisma) => {
                    const cartItems = await prisma.cart.findMany({
                        where: {
                            user_id: user.id
                        },
                        include: {
                            book: true,
                            special_offer: true
                        }
                    });
                    
                    if (cartItems.length > 0) {
                        await prisma.cart.deleteMany({
                            where: {
                                user_id: user.id
                            }
                        });
                    }

                    // const purchase_price = item.special_offer ? item.book.price * (100 - item.special_offer.discount_percentage) / 100 : item.book.price;
                    const subtotal = cartItems.reduce((acc, current) => {
                        const {book, quantity, special_offer} = current;
                        const discount = special_offer ? special_offer.discount_percentage : 0;
                        const discountedPrice = book.price * (100-discount) / 100;
                        return acc + (quantity * discountedPrice);
                    }, 0);

                    const tax_percentage = req.body.tax_percentage || 18;
                    const delivery_charges = req.body.delivery_charges || 0;

                    // how to validate correct delivery charges are given from the frontend
                    const order = await prisma.orders.create({
                        data: {
                            user_id: user.id,
                            address_id: req.body.delivery_address_id,
                            order_number: generateOrderNumber(),
                            delivery_charges: delivery_charges,
                            subtotal: subtotal,
                            tax_percentage: tax_percentage,
                            total_amount: subtotal + delivery_charges + ((subtotal * tax_percentage) / 100),
                            delivery_method: req.body.delivery_method || 'STANDARD',
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
                    
                    const updateBookPromises = cartItems.map((item) => (
                        prisma.book.update({
                            where: { id: item.book_id },
                            data: {
                                purchase_count: { increment: item.quantity }
                            }
                        }))
                    );
                    
                    await Promise.all(orderItemsPromises);
                    await Promise.all(updateBookPromises);  // run all promises in parallel
                
                });

                console.log("Purchased...");
                        
                return res.status(200).send({message: "Checked out. All cart Items are purchased"});
            
            } else {
                    return res.status(400).send({message: "Issue with your login"});
            }
        }  else {
        return res.status(400).send({message: "Issue with your login"});
        }
    }
    catch (error: any) {
        logger.error(error.message);
        return res.status(500).send({message: "An unexpected error occurred. Please try again later."});
    }
});

// retrieve current user purchased items 
router.get('/get-purchased-items', authMiddleware, async (req, res) => {
    try {
        const userEmail = req.authEmail;
        const user = await prisma.userinfo.findUnique({
            where: { email: userEmail }
        });
        
        if(user) {
            const purchasedItems = await prisma.orders.findMany({
                where: { 
                    user_id: user.id,
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
                    created_at: 'asc'
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
        const userEmail = req.authEmail;
        const user = await prisma.userinfo.findUnique({
            where: { email: userEmail }
        });
        
        if(user) {
            const orderDetails = await prisma.orders.findUnique({
                where: { 
                    user_id: user.id,
                    id: Number(id)
                }, 
                include: {
                    order_items: {
                        include: {
                            book: true,
                            special_offer: true
                        }
                    },
                    address: true
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

router.post('/requeset-cancellation/:id(\\d+)', authMiddleware, async (req, res) => {
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
            if(canReturn) {
                await prisma.orders.update({
                    where: {
                        id: Number(id)
                    },
                    data: {
                        return_status: 'REQUESTED',
                        return_requested_at: new Date(),
                        return_reason: req.body.reason
                    }
                });

                logger.info(`Return requested for order ${id} by user ${req.userId}`);
                return res.status(200).json({message: 'Cancellation requested'});
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