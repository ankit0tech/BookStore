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
            // 3. create new entry if entry doesn't exists and make sure quantity is >=1
            const userEmail = req.authEmail;
            const user = await prisma.userinfo.findUnique({
                where: { email: userEmail }
            });

            console.log(req.body);

            if (user) {
                const existingCartItem = await prisma.cart.findFirst({
                    where: {
                        user_id: user.id, 
                        book_id: req.body.book_id, 
                        offer_id: req.body.selected_offer_id ? req.body.selected_offer_id : null,
                        purchased: false
                    }
                });
                
                if (existingCartItem) {
                    logger.info('there is an existing cart item, update the existing one');

                    if((existingCartItem.quantity + req.body.quantity) == 0){
                        await prisma.cart.deleteMany({ 
                            where: {
                                user_id: user.id, 
                                book_id: req.body.book_id,
                                offer_id: req.body.selected_offer_id ? req.body.selected_offer_id : null,
                            }
                        });
                        return res.status(200).send({message: "Cart updated successfully"});
                    }
                    else if ((existingCartItem.quantity + req.body.quantity) < 0){
                        return res.status(400).send({message: "Invalid item quantity"})
                    }

                    await prisma.cart.updateMany({
                        where: {
                            user_id: user.id, 
                            book_id: req.body.book_id, 
                            offer_id: req.body.selected_offer_id ? req.body.selected_offer_id : null,
                            purchased: false
                        },
                        data: {
                            quantity: existingCartItem.quantity + req.body.quantity
                        }
                    });
                    // existingCartItem.quantity = existingCartItem.quantity + req.body.quantity;
                    // existingCartItem.save();

                    return res.status(200).send({message: "Cart updated successfully"});
                }
                else {
                    if (req.body.quantity < 1) {
                        return res.status(400).send({message: 'Please Enter valid quantity'});
                    }
                    // const book = await Book.findOne({bookId: req.body.bookId});
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
                        purchased: false
                    };
                    await prisma.cart.create({data: newCart});
                    logger.info(`Added book to cart: ${book.title} for user: ${user.id}`);

                    return res.status(200).send({message: "Cart updated successfully"});
                }

            }
            else {
                return res.status(400).send({message: "Issue with your login"});
            }

        }
        else {
            return res.status(400).send({message: "Please enter valid inputs"});
        }
    }
    catch (error: any) {
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
                    purchased: false,
                },
                select: {
                    id: true,
                    quantity: true,
                    special_offers: true,
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
            const cartData = await prisma.cart.findMany({
                where: { user_id: user.id, purchased: true }
            });
            
            let PurchasedItems: PurchaseInterface[] = [];

            const promises = cartData.map(async (item) => {
                const book = await prisma.book.findUnique({
                    where: {
                        id: item.book_id
                    }
                });
                if(book) {
                    return { book, quantity: item.quantity, purchase_date: item.purchase_date };
                }
                return null;
            });

            const resolvedPurchasedItems = await Promise.all(promises);
            PurchasedItems = resolvedPurchasedItems.filter((item) => item != null) as PurchaseInterface [];
            return res.status(200).send({ data: PurchasedItems });

            // return res.status(200).send({count: cartItems.length, data: cartItems});
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
        const userEmail = req.authEmail;
        const user = await prisma.userinfo.findUnique({
            where: {email: userEmail}
        });

        if (user) {
            await prisma.$transaction(async (prisma) => {
                
                const cartItems = await prisma.cart.findMany({
                    where: {
                        user_id: user.id, purchased: false
                    },
                    select: {
                        book_id: true,
                        quantity: true,
                    }
                });

                await prisma.cart.updateMany({
                    where: {
                        user_id: user.id, purchased: false
                    },
                    data: {
                        purchased: true,
                        purchase_date: new Date(),
                        address_id: req.body.delivery_address_id
                    }
                });

                const updatePromises = cartItems.map(item => 
                    prisma.book.update({
                        where: { id: item.book_id },
                        data: {
                            purchase_count: { increment: item.quantity }
                        }
                    })
                );

                await Promise.all(updatePromises);  // run all promises in parallel

            });
            console.log("Purchased...");

            // await prisma.cart.updateMany({
            //     where: {
            //         user_id: user.id, purchased: false
            //     },
            //     data: {
            //         purchased: true,
            //         purchase_date: new Date()
            //     }
            // });
            
            // await prisma.book_stats.updateMany({
            //     where: {

            //     },
            //     data: {

            //     }
            // });

            // cartItems.forEach(async (cartItem) => {
            //     cartItem.purchased = true;
            //     await cartItem.save();
            // });

            return res.status(200).send({message: "Checked out. All cart Items are purchased"});
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