import express, {Request, Response } from "express";
import { IBook } from "../models/bookModel";
import { bookZod } from "../zod/bookZod";
import { authMiddleware, roleMiddleware } from "./middleware";
import { IUser, User } from "../models/userModel";
import { PrismaClient, review } from "@prisma/client";
import { logger } from "../utils/logger";

const prisma = new PrismaClient();
const router = express.Router();

router.get('/search', async (req, res) => {

    try {
        const queryString = req.query.query as string | undefined;
        const query = queryString || '';

        const books = await prisma.book.findMany({
            where: {
                OR: [
                    {
                        title: {
                            contains: query,
                            mode: 'insensitive',
                        }
                    },
                    {
                        author: {
                            contains: query,
                            mode: 'insensitive',
                        }
                    }
                ],
            },
            include: {
                category: true,
            }
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
            message: 'Invalid inputs',
            errors: result.error.format()
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
        const categoryId = req.query.cid ? Number(req.query.cid) : undefined;
        const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
        const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
        const sortBy: string = req.query.sortBy ? String(req.query.sortBy) : 'id';
        const sortOrder: string = String(req.query.sortOrder) === 'desc' ? 'desc' : 'asc';
        const sortByAverageRating = req.query.sortByAverageRating !== undefined;

        let books;
        let nextCursor;
        
        books = await prisma.book.findMany({
            where: {
                category_id: categoryId || undefined,
                price: { gte: minPrice , lte: maxPrice },
                average_rating: sortByAverageRating ? { gte: 4 } : undefined,
            },
            include: {
                category: true,
            },

            take: 11,
            orderBy: [
                { [sortBy]: sortOrder },
                { id: 'asc' }
            ],
            cursor: cursor ? { id: cursor} : undefined

        });

        if(books.length > 10) {
            books.pop();
            nextCursor = books[books.length-1].id;
        }

        return res.status(200).json({ count: books.length, data: books, nextCursor: nextCursor });
    }
    catch (error: any) {
        logger.error(error.message);
        return res.status(500).json({message: "An unexpected error occurred. Please try again later."});
    }
});

// get one book by ID
router.get('/:id(\\d+)', async (req, res) => {
    try {
        const { id } = req.params;
        const book = await prisma.book.findUnique({
            where : {
                id : Number(id)
            },
            include: {
                category: true,
                special_offers: true,
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

router.post('/add-offer-for-book/:id(\\d+)', roleMiddleware(['admin', 'superadmin']), async (req: Request, res: Response) => {
    try {
        const bookId = Number(req.params.id);
        if (isNaN(bookId)) {
            return res.status(400).json({message: 'Please send valid id'});
        }

        const offerId = req.body.offerId;

        const book = await prisma.book.update({
            where: {
                id: bookId
            },
            data: {
                special_offers: {
                    connect: { id: offerId }
                }
            }
        });

        if(!book) {
            return res.status(400).json({message: 'Error. Operation failed'});
        }
        
        return res.status(200).json(book);

    } catch(error: any) {
        logger.error(error.message);
        return res.status(500).json({message: "An unexpected error occurred. Please try again later."});
    }
});

router.delete('/remove-offer/:id(\\d+)', roleMiddleware(['admin', 'superadmin']), async(req: Request, res: Response) => {
    try {

        const bookId = Number(req.params.id);
        if (isNaN(bookId)) {
            return res.status(400).json({message: 'Please send valid id'});
        }

        const offerId = req.body.offerId;

        const book = await prisma.book.update({
            where: {
                id: bookId
            },
            data: {
                special_offers: {
                    disconnect: { id: offerId }
                }
            }
        });

        if(!book) {
            return res.status(400).json({message: 'Error. Operation failed'});
        }
        
        return res.status(200).json(book);
        

    } catch (error: any) {
        logger.error(error.message);
        return res.status(500).json({message: "An unexpected error occurred. Please try again later."});
    }
})


export default router;