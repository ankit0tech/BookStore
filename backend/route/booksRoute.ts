import express from "express";
import { IBook } from "../models/bookModel";
import { bookZod } from "../zod/bookZod";
import { resourceLimits } from "worker_threads";
import { authMiddleware } from "./middleware";
import { IUser, User } from "../models/userModel";
import { PrismaClient } from "@prisma/client";
import { PrismaClientRustPanicError } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();
const router = express.Router();

router.get('/search', async (req, res) => {
    const queryString = req.query.query as string | undefined;
    const query = queryString || '';
    const categoryString = req.query.category as string | undefined;
    const category = categoryString || '';

    let allBooks: Array<IBook> = [];
    if (category!='') {
        allBooks = await prisma.book.findMany({
            where: { category: category}
        })
    }
    else {
        allBooks = await prisma.book.findMany({});
    }

    let matchingBooks: Array<IBook> = [];
    allBooks.forEach(element => {
        if (element.title.toLowerCase().includes(query.toLowerCase()) 
            || element.author.toLowerCase().includes(query.toLowerCase())) 
        {
            matchingBooks.push(element);
        }
    });

    return res.status(200).send(matchingBooks);
    
});

// save a new book
router.post('/', authMiddleware, async (req, res) => {
    try {
        
        const userMail = req.authEmail;
        const user = await prisma.userinfo.findUnique({
            where: { email: userMail }
        })
        if (!user) {
            return res.status(400).send({message: "Authentication Issue"});
        }
        if (user && user.role != "ADMIN") {
            return res.status(403).send({message: "You are not authorized for this action"});
        }

        const result = bookZod.safeParse(req.body);
        if(result.success) {
            const book = await prisma.book.create({
                data: req.body
            });
            return res.status(201).send(book);
        }
        return res.status(400).send({
            message: 'send required fields title, author, and publish_year in proper format',
        });
    }
    catch(error: any) {
        console.log(error.message);
        res.status(500).send({message: error.message});
    }
});

// return all the books
router.get('/', async (req, res) => {
    try {
        const books = await prisma.book.findMany({});
        console.log("All books: ");
        console.log(books);
        // if (req.authEmail) {
        //     console.log(req.authEmail);
        // }
        // else {
        //     console.log("No Email found");
        // }

        return res.status(200).json({count: books.length, data: books});
    }
    catch (error: any) {
        console.log(error.message);
        res.status(500).send({message: error.message});
    }
});

// get one book by ID
router.get('/:id(\\d+)', async (req, res) => {
    try {
        const { id } = req.params;
        const book = await prisma.book.findUnique({
            where : {
                id : Number(id)
            }
        });
        res.status(200).json(book);
    }
    catch (error: any) {
        console.log(error.message);
        res.status(500).send({message: error.message});
    }
});

// Update a book using Id
router.put('/:id(\\d+)', authMiddleware, async (req, res) => {
    try {
        const userMail = req.authEmail;
        const user = await prisma.userinfo.findUnique({
            where: { email: userMail }
        });
        if (!user) {
            return res.status(400).send({message: "Authentication Issue"});
        }
        if (user && user.role != "ADMIN") {
            return res.status(403).send({message: "You are not authorized for this action"});
        }

        // request validation
        // if(!req.body.title || !req.body.author || !req.body.publishYear) {
        //     return res.status(400).send({
        //         message: 'send all required fields: title, author, publishYear',
        //     });
        // }
        const result = bookZod.safeParse(req.body);
        if(result.success) {
            const { id } = req.params;
            const updatedBook = await prisma.book.update({
                where: { id: Number(id)}, 
                data: req.body
            });
            
            if(!updatedBook) {
                return res.status(400).json({message: `Book with id: ${id} could not be found`});
            }
            res.status(200).send({message: 'Book updated successfully'});
        }
        else {
            return res.status(400).send({message: "Please send valid data with all required fields."});
        }
    }
    catch (error: any) {
        console.log(error.message);
        res.status(500).send({message: error.message});
    }
});

// delete a book with id
router.delete('/:id(\\d+)', authMiddleware, async (req, res) => {
    try {
        const userMail = req.authEmail;
        const user = await prisma.userinfo.findUnique({
            where: { email: userMail }
        });
        if (!user) {
            return res.status(400).send({message: "Authentication Issue"});
        }
        if (user && user.role != "ADMIN") {
            return res.status(403).send({message: "You are not authorized for this action"});
        }

        const { id } = req.params;

        const result = await prisma.book.delete({
            where: { id: Number(id) }
        });
        console.log(`Deleted book with id ${id}`);

        if(!result) {
            return res.status(400).json({message: `Book with id: ${id} could not be found`});
        }
        res.status(200).send({message: 'Book deleted successfully'});
    }
    catch (error: any) {
        console.log(error.message);
        res.status(500).send({message: error.message});
    }
});

export default router;