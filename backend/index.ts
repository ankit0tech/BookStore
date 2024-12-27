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
import session from 'express-session';
import passport from "passport";

/* removing it for now ->    /// <reference path="./custom.d.ts" /> */

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

// app.use((req, res, next) => {
//     res.setHeader(
//         'Content-Security-Policy',
//         "script-src 'self' https://www.gstatic.com https://accounts.google.com 'unsafe-inline' 'unsafe-eval'; " +
//         "frame-src 'self' https://accounts.google.com; " +
//         "connect-src 'self' https://www.googleapis.com https://www.gstatic.com; " +
//         "default-src 'self';"
//     );
//     next();
// })

app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "script-src 'self' gstatic.com google.com 'unsafe-inline' 'unsafe-eval'; " +
        "frame-src 'self' https://*.google.com; " +
        "connect-src 'self' https://*.googleapis.com https://*.gstatic.com; " +
        "style-src 'self' 'unsafe-inline'; " +
        "default-src 'self';"
    );
    next();
});

// app.use((req, res, next) => {
//     res.setHeader(
//         'Content-Security-Policy-Report-Only',
//         "script-src 'self' https://accounts.google.com https://www.gstatic.com https://apis.google.com 'unsafe-inline' 'unsafe-eval'; " +
//         "frame-src 'self' https://accounts.google.com https://apis.google.com; " +
//         "connect-src 'self' https://www.googleapis.com https://www.gstatic.com; " +
//         "default-src 'self';"
//     );
//     next();
// });

app.use((req, res, next) => { 
    res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
    // res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');

    // res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp'); // Optional for iframe security
    next();
});

app.use(session({
    secret: 'secret_key', 
    resave: false, 
    saveUninitialized: false 
}));
app.use(passport.authenticate('session'));

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