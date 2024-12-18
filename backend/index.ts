import express, { response } from "express";
import cors from 'cors';
import { PORT } from "./config";
import mongoose from "mongoose";
import booksRoute from './route/booksRoute';
import usersRoute from './route/usersRoute';
import cartRoute from './route/cartRoute';
import authRoute from './route/auth';
import { isAuthenticated } from "./middleware";
import addressRoute from "./route/addressRoute";
/* removing it for now ->    /// <reference path="./custom.d.ts" /> */
import passport from 'passport';
import session from 'express-session';

require('./auth'); 


const app = express();

app.use(express.json());
app.use(cors());        // allow all origins

// app.use(
//     cors({
//         origin: 'http://localhost:3000',
//         methods: ['GET', 'POST', 'DELETE', 'PUT'],
//         allowedHeaders: ['Content-Type'],
//     })
// );


app.use(session({ secret: 'secret_key', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (request, response)=> {
    return  response.status(234).send('Welcome to BookStore');
});

app.use('/books', booksRoute);
app.use('/users', usersRoute);
app.use('/cart', cartRoute);
app.use('/address', addressRoute);
app.use('/auth', authRoute);


app.listen(PORT, () => {
    console.log(`App is listening to port: ${PORT}`);
});        

// mongoose
//     .connect(mongoDBURL)
//     .then(() => {
//         console.log('App connected to database');
        
//         app.listen(PORT, () => {
//             console.log(`App is listening to port: ${PORT}`);
//         });        
//     })
//     .catch((error) => {
//         console.log(error);
//     });