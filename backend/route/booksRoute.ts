import express, {Request, Response } from "express";
import { IBook } from "../models/bookModel";
import { createBookZod, updateBookZod } from "../zod/bookZod";
import { authMiddleware, roleMiddleware, optionalAuthMiddleware} from "./middleware";
import { IUser, User } from "../models/userModel";
import { PrismaClient, review } from "@prisma/client";
import { logger } from "../utils/logger";

const prisma = new PrismaClient();
const router = express.Router();

// helper function to parse data for books
const parseBookData = (data: any) => {
    const parsedData = { ...data };
    const optionalStringFields = ['description', 'isbn', 'publisher', 'languange', 'pages', 'format', 'quantity', 'shelf_location', 'sku'];

    optionalStringFields.forEach(element => {
        if(parsedData[element] === '' || parsedData[element] === null) {
            parsedData[element] = undefined;
        }
    });

    const optionalNumberFields = ['pages'];
    optionalNumberFields.forEach(element => {
        if(parsedData[element] === '' || parsedData[element] === null || isNaN(Number(parsedData[element])) ) {
            parsedData[element] = undefined;
        }
    });

    return parsedData;
}

router.get('/search', async (req, res) => {

    try {
        const queryString = req.query.query as string | undefined;
        const query = queryString || '';
        const sortBy: string = req.query.sortBy ? req.query.sortBy as string : 'id';
        const sortOrder: string = req.query.sortOrder as string === 'desc' ? 'desc' : 'asc';

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
            }, orderBy: [
                { [sortBy]: sortOrder },
                { id: 'asc'}
            ]
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

        const bookData = parseBookData(req.body);
        const result = createBookZod.safeParse(bookData);

        if(result.success) {
            const book = await prisma.book.create({
                data: result.data
            });
            return res.status(201).send({
                message: "book created successfully", 
                data: book
            });
        } else {
            return res.status(400).json({
                message: 'Please send valid data with all required fields.',
                errors: result.error.format()
            });
        }
    } catch (error: any) {
        logger.error("error while creating book", error.message);

        if (error.code === 'P2002') {
            const target = error.meta?.target;
            if (target && Array.isArray(target)) {
                if(target.includes('isbn')) {
                    return res.status(400).json({ message: "A book with this ISBN already exists"});
                } else if (target.includes('sku')) {
                    return res.status(400).json({ message: "A book the this SKU already exists"});
                }
            }

            return res.status(400).json({message: "Book with matching unique identifier already exists"});
        }

        return res.status(500).json({message: "An unexpected error occurred. Please try again later."});
    }
});

// return all the books
router.get('/', optionalAuthMiddleware, async (req, res) => {
    try {
        const cursor  = Number(req.query.cursor) || 0;
        const categoryId = req.query.cid ? Number(req.query.cid) : undefined;
        const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
        const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
        const sortBy: string = req.query.sortBy ? String(req.query.sortBy) : 'id';
        const sortOrder: string = String(req.query.sortOrder) === 'desc' ? 'desc' : 'asc';
        const sortByAverageRating = req.query.sortByAverageRating !== undefined;
        const selectWithSpecialOffer = req.query.selectWithSpecialOffer !== undefined;

        let adminRole = false;

        if(req.authEmail) {
            const userInfo = await prisma.userinfo.findUnique({
                where: {
                    email: req.authEmail
                }
            });

            if(userInfo) {
                adminRole = userInfo.role === 'admin' || userInfo.role === 'superadmin'
            }
        }

        let books;
        let nextCursor;
        
        books = await prisma.book.findMany({
            where: {
                category_id: categoryId || undefined,
                price: { gte: minPrice , lte: maxPrice },
                average_rating: sortByAverageRating ? { gte: 4 } : undefined,
                special_offers: selectWithSpecialOffer ? 
                    {
                        some: {
                            offer_valid_until: {
                                gte: new Date()
                            }
                        }
                    }: undefined
            },
            include: {
                category: true,
                special_offers: true,
            },

            take: 11,
            orderBy: [
                { [sortBy]: sortOrder },
                { id: 'asc' }
            ],
            cursor: cursor ? { id: cursor} : undefined

        });

        if(books.length > 10) {
            nextCursor = books[books.length-1].id;
            books.pop();
        }

        const transformedBooks = books.map((book) => {
            if(adminRole) {
                return {
                    ...book,
                    is_available: book.is_active && book.quantity > 0
                }
            } else {
                const { 
                    quantity, shelf_location, sku, is_active, purchase_count, 
                    updated_at, created_at, 
                    ...updatedBook 
                } = book;
                return {
                    ...updatedBook,
                    is_available: book.is_active && book.quantity > 0
                }
            }
        });

        return res.status(200).json({ count: transformedBooks.length, data: transformedBooks, nextCursor: nextCursor });

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

        const parsedBookData = parseBookData(req.body);
        const result = updateBookZod.safeParse(parsedBookData);

        if(result.success) {
            const { id } = req.params;
            const updatedBook = await prisma.book.update({
                where: { id: Number(id)}, 
                data: result.data
            });
            
            if(!updatedBook) {
                return res.status(400).json({message: `Book with id: ${id} could not be found`});
            }

            return res.status(200).json({message: 'Book updated successfully'});

        } else {
            return res.status(400).json({
                message: "Please send valid data with all required fields.", 
                errors: result.error.format()
            });
        }
    }
    catch (error: any) {
        logger.error("Error while updating book", error.message);
        
        if (error.code === 'P2002') {
            const target = error.meta?.target;
            if (target && Array.isArray(target)) {
                if(target.includes('isbn')) {
                    return res.status(400).json({ message: "A book with this ISBN already exists"});
                } else if (target.includes('sku')) {
                    return res.status(400).json({ message: "A book the this SKU already exists"});
                }
            }
            
            return res.status(400).json({message: "Book with matching unique identifier already exists"});
        }

        return res.status(500).json({message: "An unexpected error occurred. Please try again later."});
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