import express from 'express';
import { cartZod, checkoutZod } from '../zod/cartZod';
import { authMiddleware } from './middleware';
import { book, PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { generateOrderNumber } from '../utils/orderUtils';

const router = express.Router();
const prisma = new PrismaClient();

interface CartInterface {
    book: book,
    quantity : number,
}
interface PurchaseInterface {
    book: book,
    purchase_date: Date,
    quantity : number,
}

// Update cart
router.post('/update-cart', authMiddleware, async (req, res) =>{
    try {
        const result = cartZod.safeParse(req.body);
       
        if(result.success) {
            // 1. check if entry exists
            // 2. update the existing entry. if we go below 1 then remove the entry from table
            // 3. create new entry if entry doesn't exist and make sure quantity is >=1
            const userEmail = req.authEmail;
            const user = await prisma.userinfo.findUnique({
                where: { email: userEmail }
            });

            if (user) {
                const existingCartItem = await prisma.cart.findFirst({
                    where: {
                        user_id: user.id, 
                        book_id: req.body.book_id, 
                        offer_id: req.body.selected_offer_id ? req.body.selected_offer_id : null,
                    }
                });
                
                if (existingCartItem) {
                    logger.info('there is an existing cart item, update the existing one');

                    if((existingCartItem.quantity + req.body.quantity) == 0) {
                        await prisma.cart.deleteMany({ 
                            where: {
                                user_id: user.id, 
                                book_id: req.body.book_id,
                                offer_id: req.body.selected_offer_id ? req.body.selected_offer_id : null,
                            }
                        });
                        return res.status(200).send({message: "Cart updated successfully"});
                    }
                    else if ((existingCartItem.quantity + req.body.quantity) < 0) {
                        return res.status(400).send({message: "Invalid item quantity"})
                    }

                    await prisma.cart.updateMany({
                        where: {
                            user_id: user.id, 
                            book_id: req.body.book_id, 
                            offer_id: req.body.selected_offer_id ? req.body.selected_offer_id : null,
                        },
                        data: {
                            quantity: existingCartItem.quantity + req.body.quantity
                        }
                    });

                    return res.status(200).send({message: "Cart updated successfully"});
                } else {
                    if (req.body.quantity < 1) {
                        return res.status(400).send({message: 'Please Enter valid quantity'});
                    }
                    
                    const book = await prisma.book.findUnique({
                        where: {id: req.body.book_id}
                    });
                    if (!book) {
                        return res.status(400).send({message: "Error adding book to cart"});
                    }

                    const newCart = {
                        user_id: user.id,
                        book_id: req.body.book_id,
                        quantity: req.body.quantity,
                        offer_id: req.body.selected_offer_id ? req.body.selected_offer_id : undefined,
                    };

                    await prisma.cart.create({data: newCart});
                    logger.info(`Added book to cart: ${book.title} for user: ${user.id}`);

                    return res.status(200).send({message: "Cart updated successfully"});
                }

            } else {
                return res.status(400).send({message: "Issue with your login"});
            }

        } else {
            return res.status(400).send({message: "Please enter valid inputs"});
        }
    } catch (error: any) {
        logger.error(error.message);
        return res.status(500).send({message: "An unexpected error occurred. Please try again later."});
    }
});

// retrieve current user cart
router.get('/get-cart-items', authMiddleware, async (req, res) => {
    try {
        
        const userEmail = req.authEmail;
        const user = await prisma.userinfo.findUnique({ 
            where: { email:userEmail }
        });
        if(user) {
            const cartItems = await prisma.cart.findMany({
                where: {
                    user_id: user.id, 
                },
                select: {
                    id: true,
                    quantity: true,
                    special_offer: true,
                    book: true
                }, orderBy: {
                    created_at: 'asc'
                }
            });
            
            return res.status(200).send({ data: cartItems });
        
        }
        else {
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

export default router;