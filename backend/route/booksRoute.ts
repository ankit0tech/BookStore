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
        // const category = categoryString || '';

        const books = await prisma.book.findMany({
            where: {
                OR: [
                    {
                        title: {
                            contains: query,
                            mode: 'insensitive',
                        },
                        category: categoryString 
                    },
                    {
                        author: {
                            contains: query,
                            mode: 'insensitive',
                        },
                        category: categoryString
                    },
                ],
            },
        });
    
        return res.status(200).send(books);
    
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
        const cursor  = Number(req.query.cursor) || 0;
        const direction = req.query.direction || '';

        let books;
        let nextCursor;
        let prevCursor;

        if ( direction == 'prev') {
            books = await prisma.book.findMany({
                where: cursor ? { id: { lt: Number(cursor) } } : undefined,
                take: -11,
                orderBy: {
                    id: 'asc'
                }
            });

            if(books.length > 10) {
                books.shift();
                prevCursor = books[0].id;
            }

            nextCursor = books.length !== 0 ? books[books.length-1].id : null;
            if (nextCursor) {
                const lastBook = await prisma.book.findFirst({ orderBy: { id: 'desc'}});
                if(lastBook && lastBook.id == nextCursor) {
                    nextCursor = null;
                }
            }

        } else {
            books = await prisma.book.findMany({
                where: cursor ? { id: { gt: Number(cursor) } } : undefined,
                take: 11,
                orderBy: {
                    id: 'asc'
                }
            });

            if(books.length > 10) {
                books.pop();
                nextCursor = books[books.length-1].id;
            }
            prevCursor = books.length !== 0 ? books[0].id : null;

            if(prevCursor) {
                const firstBook = await prisma.book.findFirst({ orderBy: { id: 'asc'}});
                if(firstBook && firstBook.id == prevCursor) {
                    prevCursor = null;
                }
            }

        }

        return res.status(200).json({ count: books.length, data: books, nextCursor: nextCursor, prevCursor: prevCursor });
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