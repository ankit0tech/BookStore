import express from 'express';
import { Cart, ICart } from "../models/cartModel";
import { cartZod } from '../zod/cartZod';
import { authMiddleware } from './middleware';
import { IUser, User } from '../models/userModel';
import { Book } from '../models/bookModel';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

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
                        user_id: user.id, book_id: req.body.book_id, purchased: false
                    }
                });
                if (existingCartItem) {
                    console.log('there is an existing cart item, update the existing one');

                    if((existingCartItem.quantity + req.body.quantity) == 0){
                        await prisma.cart.deleteMany({ 
                            where: {user_id: user.id, book_id: req.body.book_id}
                        });
                        return res.status(200).send({message: "Cart updated successfully"});
                    }
                    else if ((existingCartItem.quantity + req.body.quantity) < 0){
                        return res.status(400).send({message: "Invalid item quantity"})
                    }

                    await prisma.cart.updateMany({
                        where: {
                            user_id: user.id, book_id: req.body.book_id, purchased: false
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
                        book_title: book.title,
                        quantity: req.body.quantity,
                        purchased: false
                    };
                    const cartItem = await prisma.cart.create({data: newCart});
                    console.log('Added:', book.title);
                    console.log(cartItem);

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
        console.log(error.message);
        return res.status(500).send({message: error.message});
    }
});

// retrieve current user cart
router.get('/get-cart-items', authMiddleware, async (req, res) => {
    try {
        console.log('GET CART ITEM')
        const userEmail = req.authEmail;
        const user = await prisma.userinfo.findUnique({ 
            where: { email:userEmail }
        });
        if(user) {
            const cartItems = await prisma.cart.findMany({
                where: {user_id: user.id, purchased: false}
            });
            return res.status(200).send({count: cartItems.length, data: cartItems});
        }
        else {
            return res.status(400).send({message: "Issue with your login"});
        }
    }
    catch (error: any) {
        console.log(error.message);
        return res.status(500).send({message: error.message});
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
            const cartItems = await prisma.cart.findMany({
                where: { user_id: user.id, purchased: true }
            });
            return res.status(200).send({count: cartItems.length, data: cartItems});
        }
        else {
            return res.status(400).send({message: "Issue with your login"});
        }
    }
    catch (error: any) {
        console.log(error.message);
        return res.status(500).send({message: error.message});
    }
});


// checkout
router.post('/checkout', authMiddleware, async (req, res) =>{
    // take the user
    // take all the un-purchased items for the user and move them to purchased state
    try {
        console.log("chekcout...");
        const userEmail = req.authEmail;
        const user = await prisma.userinfo.findUnique({
            where: {email: userEmail}
        });
        if (user) {

            // // Apply transactions here
            await prisma.cart.updateMany({
                where: {
                    user_id: user.id, purchased: false
                },
                data: {
                    purchased: true
                }
            });
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
        console.log(error.message);
        return res.status(500).send({message: error.message});
    }
});

export default router;