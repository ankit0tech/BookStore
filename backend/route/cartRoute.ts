import express from 'express';
import { cartZod } from '../zod/cartZod';
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


export default router;