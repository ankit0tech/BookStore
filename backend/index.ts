import express, { response } from "express";
import cors from 'cors';
import { config } from "./config";
import booksRoute from './route/booksRoute';
import usersRoute from './route/usersRoute';
import cartRoute from './route/cartRoute';
import ordersRoute from './route/ordersRoute';
import orderManagementRoute from './route/orderManagementRoute';
import authRoute from './route/auth';
import addressesRoute from "./route/addressesRoute";
import adminRoute from './route/adminRoute';
import reviewsRoute from './route/reviewsRoute';
import wishlistRoute from './route/wishlistRoute';
import recentlyviewedRoute from './route/recentlyviewedRoute';
import categoriesRoute from './route/categoriesRoute';
import offersRoute from './route/offersRoute';
import { logger } from './utils/logger';


const app = express();

app.use(express.json());
// app.use(cors());        // allow all origins
app.use(
    cors({
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'DELETE', 'PUT'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    })
);

app.use((req, res, next) => {
    // res.removeHeader('Cross-Origin-Opener-Policy');
    // res.removeHeader('Cross-Origin-Embedder-Policy');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none'); // Use cautiously

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


app.listen(config.server.port, () => {
    logger.info(`App is listening to port: ${config.server.port}`);
});        
