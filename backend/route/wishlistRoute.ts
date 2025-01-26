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
        
        const wishlistItem = await prisma.wishlist.create({
            data: {
                user_id: user.id,
                book_id: Number(id)
            }
        });

        if (!wishlistItem) {
            logger.error('Error while adding item to wishlist');
            return res.status(400).json({ message: 'Error while adding item to wishlist'});
        }
        return res.status(200).json({message: 'Item added to wishlist'});

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