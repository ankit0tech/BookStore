import express, { Request, Response,  }from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from './middleware';
import { reviewZod } from '../zod/reviewZod';
import { logger } from '../utils/logger';
import { retrieveUser } from '../utils/userUtils';


const router = express.Router();
const prisma = new PrismaClient();

router.get('/book/:id(\\d+)', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const reviews = await prisma.review.findMany({
            where: {
                book_id: Number(id),
            },
            include: {
                user: {
                    select: {
                        email: true,
                    },
                },
            },
        });

        return res.status(200).json(reviews);

    } catch (e) {
        logger.error('Error while fetching review for book');
        return res.status(500).json({ Message: 'Error while fetching review for book'});
    }
});

router.get('/book/:id(\\d+)/user', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await retrieveUser(req, prisma);
        if (!user) {
            logger.error('Error occurred fetching user while adding review');
            return res.status(401).json({ message: 'Error occurred, try again'});
        }
    
        const review = await prisma.review.findUnique({
            where: {
                user_id_book_id: {
                    user_id: user.id,
                    book_id: Number(id)
                }
            }
        });

        return res.status(200).json(review);

    } catch (e) {
        logger.error('Error while fetching review for book');
        return res.status(500).json({ Message: 'Error while fetching review for book'});
    }
});

router.get('/user', authMiddleware, async (req: Request, res: Response) => {
    try {
        const user = await retrieveUser(req, prisma);
        
        if (!user) {
            logger.error('Error occurred while fetching user while adding review');
            return res.status(401).json({ message: 'Error occurred, try again'});
        }

        const reviews = await prisma.review.findMany({
            where: {
                user_id: user.id,
            },
            include: {
                book: {
                    select: {
                        title: true
                    }
                }
            }
        });

        return res.status(200).json(reviews);

    } catch (e) {
        logger.error('Error while fetching review for book');
        return res.status(500).json({ Message: 'Error while fetching review for book'});
    }
});

router.post('/:id(\\d+)', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const bookId = Number(id);
        if(isNaN(bookId)) {
            return res.status(400).json({message: 'Invalid book id'});
        }

        const result = reviewZod.safeParse(req.body);
        
        if (result.success) {
            
            const user = await retrieveUser(req, prisma);
            if (!user) {
                logger.error('Error occurred while fetching user while adding review');
                return res.status(401).json({ message: 'Error occurred, try again'});
            }
        
            const review = await prisma.$transaction(async (prisma) => {

                const newReview = await prisma.review.create({
                    data: {
                        rating: req.body.rating,
                        review_text: req.body.review_text,
                        user_id: user.id,
                        book_id: bookId
                    }
                });
            
                const avgRating = await prisma.review.aggregate({
                    _avg: { rating: true},
                    where: { book_id: bookId}
                });
                
                const book = await prisma.book.update({
                    where: {
                        id: bookId
                    },
                    data: {
                        average_rating: avgRating._avg.rating || 0
                    }
                });

                return newReview;
            });

            if (!review) {
                logger.error('Error while adding review for book');
                return res.status(400).json({ message: 'Error while adding review for book'});
            } else {
                logger.info('Review added for book');
                return res.status(200).json({ message: 'Review added for book'});
            }

        } else {
            logger.error('Invalid inputs while adding review');
            return res.status(403).json({ message: 'Invalid inputs while adding review' })
        }
        
    } catch (e) {
        logger.error('Error while adding review for book');
        return res.status(500).json({ message: 'Error while adding review for book'});
    }
});

router.put('/:id(\\d+)', authMiddleware, async (req: Request, res: Response) => {
    try {

        const { id } = req.params;
        const bookId = Number(id);
        if(isNaN(bookId)) {
            return res.status(400).json({message: 'Invalid book id'});
        }

        const result = reviewZod.safeParse(req.body);
        if(result.success) {

            const user = await retrieveUser(req, prisma);
            if (!user) {
                logger.error('Error occurred while fetching user while adding review');
                return res.status(401).json({ message: 'Error occurred, try again'});
            }

            const review = await prisma.$transaction(async (prisma) => {

                
                const updatedReview = await prisma.review.update({
                    where: {
                        user_id_book_id: {
                            user_id: user.id,
                            book_id: Number(id)
                        }
                    },
                    data: {
                        rating: req.body.rating,
                        review_text: req.body.review_text,
                    }
                });

                const avgRating = await prisma.review.aggregate({
                    _avg: { rating: true},
                    where: { book_id: bookId}
                });
                
                const book = await prisma.book.update({
                    where: {
                        id: bookId
                    },
                    data: {
                        average_rating: avgRating._avg.rating || 0
                    }
                });

                return updatedReview;
            });


            if(review) {
                logger.info('Updated the review');
                return res.status(200).json({message: 'Updated the review'});
            } else {
                logger.error('Error while updating review');
                return res.status(403).json({message: 'Error while updating review'});
            }
        } else {
            logger.error('Invalid input while updating review');
            return res.status(403).json({message: 'Invalid input while updating review'});
        }

    } catch (e) {
        logger.error('Error updating the review');
        return res.status(500).json({ message: 'Error updating the review'});
    }
});

router.delete('/:id(\\d+)', authMiddleware, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const bookId = Number(id);
        if(isNaN(bookId)) {
            return res.status(400).json({message: 'Invalid book id'});
        }

        const user = await retrieveUser(req, prisma);
        if (!user) {
            logger.error('Error occurred while fetching user while adding review');
            return res.status(401).json({ message: 'Error occurred, try again'});
        }
    
        const review = await prisma.$transaction(async (prisma) => {

            const deletedReview = await prisma.review.delete({
                where: {
                    user_id_book_id: {
                        user_id: user.id,
                        book_id: Number(id)
                    }
                }
            });

            const avgRating = await prisma.review.aggregate({
                _avg: { rating: true},
                where: { book_id: bookId}
            });
            
            const book = await prisma.book.update({
                where: {
                    id: bookId
                },
                data: {
                    average_rating: avgRating._avg.rating || 0
                }
            });

            return deletedReview;
        });
        
        if(!review) {
            logger.error('Error while deleting review');
            return res.status(403).json({ message: 'Error while deleting review' });
        }
        logger.info('Deleted review');
        return res.status(200).json({ message: 'Deleted the review successfully' });

    } catch (e) {
        logger.error('Error while deleting the review');
        return res.status(500).json({ message: 'Error while updating the review'});
    }
});

export default router;