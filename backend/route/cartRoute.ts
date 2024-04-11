import express from 'express';
import { Cart, ICart } from "../models/cartModel";
import { cartZod } from '../zod/cartZod';
import { authMiddleware } from './middleware';
import { IUser, User } from '../models/userModel';

const router = express.Router();

// Update cart
router.post('/update-cart', authMiddleware, async (req, res) =>{
    try {
        const result = cartZod.safeParse(req.body);
       
        if(result.success) {
            // 1. check if entry exists
            // 2. update the existing entry. if we go below 1 then remove the entry from table
            // 3. create new entry if entry doesn't exists and make sure quantity is >=1
            const userEmail = req.authEmail;
            const user: IUser|null = await User.findOne({email: userEmail});

            if (user) {
                const existingCartItem = await Cart.findOne({userId: user._id, bookId: req.body.bookId, purchased: false});
                if (existingCartItem) {
                    console.log('there is an existing cart item, update the existing one');

                    if((existingCartItem.quantity + req.body.quantity) == 0){
                        await Cart.findOneAndDelete({userId: user._id, bookId: req.body.bookId});
                        return res.status(200).send({message: "Cart updated successfully"});
                    }
                    else if ((existingCartItem.quantity + req.body.quantity) < 0){
                        return res.status(400).send({message: "Invalid item quantity"})
                    }

                    existingCartItem.quantity = existingCartItem.quantity + req.body.quantity;
                    existingCartItem.save();
                    
                    return res.status(200).send({message: "Cart updated successfully"});
                }
                else {
                    if (req.body.quantity < 1) {
                        return res.status(400).send({message: 'Please Enter valid quantity'});
                    }
                    const newCart = {
                        userId: user._id,
                        bookId: req.body.bookId,
                        quantity: req.body.quantity,
                        purchased: false
                    };
                    const cartItem: ICart = await Cart.create(newCart);
                    // console.log(cartItem);

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
        const userEmail = req.authEmail;
        const user: IUser|null = await User.findOne({email:userEmail});
        if(user) {
            const cartItems = await Cart.find({userId: user._id, purchased: false});
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
        const user: IUser|null = await User.findOne({email:userEmail});
        if(user) {
            const cartItems = await Cart.find({userId: user._id, purchased: true});
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
        const user: IUser|null = await User.findOne({email: userEmail});
        if (user) {
            const cartItems = await Cart.find({userId: user._id, purchased: false});
            // // Apply transactions here
            cartItems.forEach(async (cartItem) => {
                cartItem.purchased = true;
                await cartItem.save();
            });

            return res.status(200).send({message: "Checked out"});
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