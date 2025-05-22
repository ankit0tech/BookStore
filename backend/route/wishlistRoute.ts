import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from './middleware';
import { logger } from '../utils/logger';
import { retrieveUser } from '../utils/userUtils';


const router = express.Router();
const prisma = new PrismaClient();

router.post('/add/:id(\\d+)', authMiddleware, async (req: Request, res: Response) => {
    try {

        const { id } = req.params;
        const user = await retrieveUser(req, prisma);
        if (!user) {
            logger.error('Error fetching user while adding item to wishlist');
            return res.status(401).json({ message: 'Error occurred, try again'});
        }

        const book = await prisma.book.findUnique({
            where: {
                id: Number(id)
            }
        });
        if(!book) {
            logger.error(`Book with id ${id} not found while adding to whishlist`);
            return res.status(404).json({ message: 'Book not found'});
        }

        const existingWishlist = await prisma.wishlist.findUnique({
            where: {
                user_id_book_id: {
                    user_id: user.id,
                    book_id: Number(id)
                },
            },
            include: {
                book: {
                    select: {
                        title: true
                    }
                }
            }
        });

        if(existingWishlist) {
            logger.info(`User ${user.email} attempted to add book ${existingWishlist.book.title} in wishlist`);
            return res.status(200).json({ 
                message: 'Alreay part of wishlist',
                bookTitle: existingWishlist.book.title
            });
        }
        
        const wishlistItem = await prisma.wishlist.create({
            data: {
                user_id: user.id,
                book_id: Number(id)
            },
            include: {
                book: {
                    select: {
                        title: true
                    }
                }
            }
        });

        if (!wishlistItem) {
            logger.error('Error while adding item to wishlist');
            return res.status(400).json({ message: 'Error while adding item to wishlist'});
        }
        return res.status(200).json({
            message: 'Item added to wishlist',
            bookTitle: wishlistItem.book.title
        });

    } catch (e) {
        logger.error('Error while adding item to wishlist');
        return res.status(500).json({ message: 'Error while adding item to wishlist'});
    }
});

router.get('/items', authMiddleware, async ( req: Request, res: Response) => {
    try {
        
        const user = await retrieveUser(req, prisma);
        if (!user) {
            logger.error('Error fetching user while adding item to wishlist');
            return res.status(401).json({ message: 'Error occurred, try again'});
        }
        
        const wishlist = await prisma.wishlist.findMany({
            where: {
                user_id: user.id
            },
            include: {
                book: true
            }
        });
        
        if(!wishlist) {
            logger.error('Error while fetching wishlist');
            return res.status(400).json({ message: 'Error while fetching wishlist'});
        }

        logger.info(`Fetching wishlist for user: ${user.email}`);
        return res.status(200).json(wishlist);

    } catch (e) {
        logger.error('Error while fetching wishlist');
        return res.status(500).json({ message: 'Error while fetching wishlist'});
    }
});

router.delete('/remove/:id(\\d+)', authMiddleware, async ( req: Request, res: Response) => {

    try {
        const { id } = req.params;
        const user = await retrieveUser(req, prisma);
        if (!user) {
            logger.error('Error fetching user while deleting item from wishlist');
            return res.status(401).json({ message: 'Error occurred, try again'});
        }

        const deletedItem = await prisma.wishlist.delete({
            where: {
                user_id_book_id: {
                    user_id: user.id,
                    book_id: Number(id)
                }
            }
        });
        
        if(!deletedItem) {
            logger.error('Error fetching user while deleting item from wishlist');
            return res.status(400).json({ message: 'Error occurred, try again'});
        }

        return res.status(200).json({ message: 'Successfully delete item from wishlist'});

    } catch (e) {
        logger.error('Error while removing item from wishlist');
        return res.status(500).json({ message: 'Error while removing item from wishlist'});
    }
});


export default router;