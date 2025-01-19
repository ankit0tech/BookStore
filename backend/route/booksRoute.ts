import express from "express";
import { IBook } from "../models/bookModel";
import { bookZod } from "../zod/bookZod";
import { authMiddleware, roleMiddleware } from "./middleware";
import { IUser, User } from "../models/userModel";
import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger";

const prisma = new PrismaClient();
const router = express.Router();

router.get('/search', async (req, res) => {

    try {
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
    
    } catch(error: any) {
        logger.error(error.message);
        return res.status(500).json({message: "An unexpected error occurred. Please try again later."});
    }
});

// save a new book
router.post('/', roleMiddleware(['admin', 'superadmin']), async (req, res) => {
    try {

        const result = bookZod.safeParse(req.body);
        if(result.success) {
            const book = await prisma.book.create({
                data: req.body
            });
            return res.status(201).send(book);
        }
        return res.status(400).json({
            message: 'send required fields title, author, and publish_year in proper format',
        });
    }
    catch(error: any) {
        logger.error(error.message);
        res.status(500).json({message: "An unexpected error occurred. Please try again later."});
    }
});

// return all the books
router.get('/', async (req, res) => {
    try {
        const books = await prisma.book.findMany({});
        return res.status(200).json({count: books.length, data: books});
    }
    catch (error: any) {
        logger.error(error.message);
        res.status(500).json({message: "An unexpected error occurred. Please try again later."});
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
        res.status(200).send(book);
    }
    catch (error: any) {
        logger.error(error.message);
        res.status(500).json({message: "An unexpected error occurred. Please try again later."});
    }
});

// Update a book using Id
router.put('/:id(\\d+)', roleMiddleware(['admin', 'superadmin']), async (req, res) => {
    try {

        const result = bookZod.safeParse(req.body);
        logger.info(req.body);

        if(result.success) {
            const { id } = req.params;
            const updatedBook = await prisma.book.update({
                where: { id: Number(id)}, 
                data: req.body
            });
            
            if(!updatedBook) {
                return res.status(400).json({message: `Book with id: ${id} could not be found`});
            }
            return res.status(200).json({message: 'Book updated successfully'});
        }
        else {
            return res.status(400).json({message: "Please send valid data with all required fields."});
        }
    }
    catch (error: any) {
        logger.error(error.message);
        res.status(500).json({message: "An unexpected error occurred. Please try again later."});
    }
});

// delete a book with id
router.delete('/:id(\\d+)', roleMiddleware(['admin', 'superadmin']), async (req, res) => {
    try {
        const { id } = req.params;

        const result = await prisma.book.delete({
            where: { id: Number(id) }
        });
        logger.info(`Deleted book with id ${id}`);

        if(!result) {
            return res.status(400).json({message: `Book with id: ${id} could not be found`});
        }
        res.status(200).json({message: 'Book deleted successfully'});
    }
    catch (error: any) {
        logger.error(error.message);
        res.status(500).json({message: "An unexpected error occurred. Please try again later."});
    }
});

export default router;