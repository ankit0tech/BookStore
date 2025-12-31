import express from "express";
import cors from 'cors';
import { config } from "./config.js";
import booksRoute from './route/booksRoute.js';
import usersRoute from './route/usersRoute.js';
import cartRoute from './route/cartRoute.js';
import ordersRoute from './route/ordersRoute.js';
import orderManagementRoute from './route/orderManagementRoute.js';
import authRoute from './route/auth.js';
import addressesRoute from "./route/addressesRoute.js";
import adminRoute from './route/adminRoute.js';
import reviewsRoute from './route/reviewsRoute.js';
import wishlistRoute from './route/wishlistRoute.js';
import recentlyviewedRoute from './route/recentlyviewedRoute.js';
import categoriesRoute from './route/categoriesRoute.js';
import offersRoute from './route/offersRoute.js';
import userManagementRoute from './route/userManagementRoute.js';
import { logger } from './utils/logger.js';


const app = express();

app.use(express.json());

app.use(
    cors({
        origin: config.frontend.url,
        methods: ['GET', 'POST', 'DELETE', 'PUT'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    })
);

app.use((req, res, next) => {

    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    res.setHeader(
        'Content-Security-Policy',
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https://www.gstatic.com https://accounts.google.com; " +
        "frame-src 'self' https://accounts.google.com; " +
        "connect-src 'self' https://www.googleapis.com; " +
        "report-uri /csp-violation-report-endpoint" +
        "default-src 'self';"
    );
    
    next();
});


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

app.use((req, res, next) => { 
    res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
    next();
});


app.get('/', (request, response)=> {
    return  response.status(234).send('Welcome to BookStore');
});

app.use('/books', booksRoute);
app.use('/users', usersRoute);
app.use('/cart', cartRoute);
app.use('/orders', ordersRoute);
app.use('/order-management', orderManagementRoute);
app.use('/addresses', addressesRoute);
app.use('/auth', authRoute);
app.use('/admin', adminRoute);
app.use('/reviews', reviewsRoute);
app.use('/wishlist', wishlistRoute);
app.use('/recently-viewed', recentlyviewedRoute);
app.use('/categories', categoriesRoute);
app.use('/offers', offersRoute);
app.use('/user-management', userManagementRoute);


app.listen(config.server.port, () => {
    logger.info(`App is listening to port: ${config.server.port}`);
});        
