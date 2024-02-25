import express, { response } from "express";
import cors from 'cors';
import { PORT, mongoDBURL } from "./config.js";
import mongoose from "mongoose";
import booksRoute from './route/booksRoute.js';
import usersRoute from './route/usersRoute.js';

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

app.get('/', (request, response)=> {
    return  response.status(234).send('Welcome to BookStore');
});

app.use('/books', booksRoute);
app.use('/users', usersRoute);

mongoose
    .connect(mongoDBURL)
    .then(() => {
        console.log('App connected to database');
        
        app.listen(PORT, () => {
            console.log(`App is listening to port: ${PORT}`);
        });        
    })
    .catch(() => {
        console.log(error);
    });