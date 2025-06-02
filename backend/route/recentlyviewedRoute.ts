import express, { Request, Response,  }from 'express';
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
            logger.error('Error occurred while fetching user while adding review');
            return res.status(401).json({ message: 'Error occurred, try again'});
        }

        const recently_viewed = await prisma.$transaction(async (prisma) => {

            const newRecentlyViewed = await prisma.recently_viewed.upsert({
                where: {
                    user_id_book_id: {user_id: user.id, book_id: Number(id)}
                },
                update: {
                    updated_at: new Date()
                },
                create: {
                    user_id: user.id,
                    book_id: Number(id)
                }
            });
    
            const recently_viewed_items = await prisma.recently_viewed.findMany({
                where: {
                    user_id: user.id
                },
                orderBy: {
                    updated_at: 'desc',
                }
            });
    
            if(recently_viewed_items.length > 5) {
                
                const oldest_item = recently_viewed_items[recently_viewed_items.length - 1];
                await prisma.recently_viewed.delete({
                    where: {
                        id: oldest_item.id
                    }
                });    
            }

            return newRecentlyViewed;
        });

        if (!recently_viewed) {
            logger.error(`Error while adding item to recently viewed for user: ${user.email}`);
            return res.status(400).json({ message: 'Error while adding item to recently viewed'});
        }

        logger.info(`Successfully added recently viewed item for user: ${user.email}`);
        return res.status(200).send({ message: 'Successfully added item to recently viewed'});

    } catch(e) {
        console.log(e);
        logger.error('Error occurred while adding item to recently viewed');
        return res.status(500).json({ message: 'Error occurred while adding item to recently viewed' })
    }

});

router.get('/', authMiddleware, async (req: Request, res: Response) => {
    try {
        
        const user = await retrieveUser(req, prisma);
        if (!user) {
            logger.error('Error occurred while fetching user while adding review');
            return res.status(401).json({ message: 'Error occurred, try again'});
        }

        const items = await prisma.recently_viewed.findMany({
            where: {
                user_id: user.id
            },
            include: {
                book: true
            },
            orderBy: {
                created_at: 'asc'
            }
        });

        if(!items) {
            logger.error(`Error while fetching recently viewed items for user: ${user.email}`);
            return res.status(400).json({ message: 'Error while fetching recently viewed items'});

        }
        logger.info(`Retrieved recently viewed items for user: ${user.email}`);
        return res.status(200).json(items);

    } catch(e) {
        logger.error('Error occurred while fetching item to recently viewed');
        return res.status(500).json({ message: 'Error occurred while fetching item to recently viewed' })
    }
});

router.delete('/remove/:id(\\d+)', authMiddleware, async (req: Request, res: Response) => {
    try {

        const { id } = req.params;
        const user = await retrieveUser(req, prisma);
        if (!user) {
            logger.error('Error occurred while fetching user while adding review');
            return res.status(401).json({ message: 'Error occurred, try again'});
        }

        const removedItem = await prisma.recently_viewed.delete({
            where: {
                user_id_book_id: {user_id: user.id, book_id: Number(id)}
            }
        });

        if(!removedItem) {
            logger.error(`Error while removing item from recently viewed for user: ${user.email}`);
            return res.status(400).json({ message: 'Error while removing item from recently viewed'});

        }
        logger.info(`Successfully removed item from recently viewed for user: ${user.email}`);
        return res.status(200).json('Successfully removed item from recently viewed');


    } catch(e) {
        logger.error('Error occurred while removing item to recently viewed');
        return res.status(500).json({ message: 'Error occurred while removing item to recently viewed' })
    }

}); 

export default router;