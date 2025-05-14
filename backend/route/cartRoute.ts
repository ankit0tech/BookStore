import express from 'express';
import { cartZod, checkoutZod } from '../zod/cartZod';
import { authMiddleware } from './middleware';
import { book, PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

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
            // 3. create new entry if entry doesn't exists and make sure quantity is >=1
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
            const purchasedItems = await prisma.purchase.findMany({
                where: { 
                    user_id: user.id
                }, 
                include: {
                    book: true,
                    address: true,
                    special_offer: true
                }
            });

            return res.status(200).send({ data: purchasedItems });
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


// checkout
router.post('/checkout', authMiddleware, async (req, res) =>{
    // take the user
    // take all the un-purchased items for the user and move them to purchased state
    try {
        logger.info("chekcout...");
        const result = checkoutZod.safeParse(req.body);
        
        if (result.success) {
            const userEmail = req.authEmail;
            const user = await prisma.userinfo.findUnique({
                where: {email: userEmail}
            });
            
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
                    
                    const addPurchasePromise = cartItems.map(item => {
                        const purchase_price = item.special_offer ? item.book.price * (100 - item.special_offer.discount_percentage) / 100 : item.book.price;
                        prisma.purchase.create({
                            data: {
                                user_id: user.id,
                                book_id: item.book_id,
                                quantity: item.quantity,
                                purchase_price: purchase_price,
                                offer_id: item.offer_id,
                                address_id: req.body.delivery_address_id,
                                purchase_date: new Date(),
                            }
                        })
                    });
                    
                    const updateBookPromises = cartItems.map(item => 
                        prisma.book.update({
                            where: { id: item.book_id },
                            data: {
                                purchase_count: { increment: item.quantity }
                            }
                        })
                    );
                    
                    await Promise.all(addPurchasePromise);
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