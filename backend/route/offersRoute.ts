import express, {Request, Response} from 'express';
import { PrismaClient } from '@prisma/client';
import { offerZod } from '../zod/offerZod.js';
import { logger } from '../utils/logger.js';
import { roleMiddleware } from './middleware.js';

const router = express.Router();
const prisma = new PrismaClient();


router.get('/active-offers', roleMiddleware(['admin', 'superadmin']), async (req: Request, res: Response) => {
    try {
        const offers = await prisma.special_offers.findMany({
            where: {
                offer_valid_until: {
                    gte: new Date()
                }
            },
            orderBy: {
                created_at: 'asc'
            }
        });
        if(!offers) {
            return res.status(400).json({message: "Error while retrieving special offer"});
        }

        return res.status(200).json(offers);

    } catch (error: any) {
        logger.error(error.message);
        return res.status(500).json({message: "An unexpected error occurred. Please try again later."});
    }
});


router.get('/:id(\\d+)', roleMiddleware(['admin', 'superadmin']), async(req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if(isNaN(id)) {
            return res.status(400).json({message: "Invalid Id"});
        }
        
        const offer = await prisma.special_offers.findUnique({
            where: {
                id: id
            }
        });
        if(!offer) {
            return res.status(400).json({message: "Error while retrieving special offer"});
        }

        return res.status(200).json(offer);
        
    } catch (error: any) {
        logger.error(error.message);
        return res.status(500).json({message: "An unexpected error occurred. Please try again later."});
    }
});

router.get('/', roleMiddleware(['admin', 'superadmin']), async (req: Request, res: Response) => {

    try {
        
        const query = req.query.query as string | undefined;
        const expiryStatus = req.query.expiryStatus as string | undefined;
        const percentageFilter = req.query.percentageFilter ? Number(req.query.percentageFilter) : undefined;
        
        const offers = await prisma.special_offers.findMany({
            where: {
                ...(percentageFilter && {discount_percentage: { gte: percentageFilter }}),
                ...(expiryStatus?.toLowerCase() === 'valid' && {offer_valid_from: { lte: new Date }, offer_valid_until: { gte: new Date }}),
                ...(expiryStatus?.toLowerCase() === 'expired' && {offer_valid_until: { lte: new Date }}),
                ...(query && {
                    OR: [
                        {
                            offer_type: {
                                contains: query,
                                mode: 'insensitive'
                            }
                        },{
                            description: {
                                contains: query,
                                mode: 'insensitive'
                            }
                        }
                    ]
                })
            },
            orderBy: {
                created_at: 'asc'
            }
        });

        return res.status(200).json(offers);

    } catch(error: any) {
        logger.error(error.message);
        return res.status(500).json({message: "An unexpected error occurred. Please try again later."});
    }
});


// router.post('/add-offer-for-book/:id(\\d+)', roleMiddleware(['admin', 'superadmin']), async (req: Request, res: Response) => {
//     try {
//         const bookId = Number(req.params.id);
//         if (isNaN(bookId)) {
//             return res.status(400).json({message: 'Please send valid id'});
//         }

//         const offerId = req.body.offerId;

//         const book = await prisma.book.update({
//             where: {
//                 id: bookId
//             },
//             data: {
//                 special_offers: {
//                     connect: { id: offerId }
//                 }
//             }
//         });

//         if(!book) {
//             return res.status(400).json({message: 'Error. Operation failed'});
//         }
        
//         return res.status(200).json(book);

//     } catch(error: any) {
//         logger.error(error.message);
//         return res.status(500).json({message: "An unexpected error occurred. Please try again later."});
//     }
// });

router.post('/', roleMiddleware(['admin', 'superadmin']), async(req: Request, res: Response) => {
    try {
        const result = offerZod.safeParse(req.body);
        
        if(result.success) {
            const offer = await prisma.special_offers.create({
                data: result.data
            });

            return res.status(201).json(offer);

        } else {
            return res.status(400).json({message: "Invalid Inputs", errors: result.error.format()});
        }

    } catch(error: any) {
        logger.error(error.message);
        return res.status(500).json({message: "An unexpected error occurred. Please try again later."});
    }
});

router.put('/:id(\\d+)', roleMiddleware(['admin', 'superadmin']), async(req: Request, res: Response) => {
    try {
        const result = offerZod.safeParse(req.body);
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({message: "Please send valid id"});
        }
        
        if(result.success) {
            const offer = await prisma.special_offers.update({
                where: {
                    id: id
                },
                data: req.body
            });

            if(!offer) {
                return res.status(400).json({message: "Failed to update offer"});
            }

            return res.status(200).json({message: "Updated offer successfully"});
        } else {
            return res.status(400).json({message: "Invalid inputs", errors: result.error.format()});
        }

    } catch(error: any) {
        logger.error(error.message);
        return res.status(500).json({message: "An unexpected error occurred. Please try again later."});        
    }
});

router.delete('/:id(\\d+)', roleMiddleware(['admin', 'superadmin']), async(req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if(isNaN(id)) {
            return res.status(400).json({message: "Invalid Id"});
        }
        
        const deletedOffer = await prisma.special_offers.delete({
            where: {
                id: id
            }
        });
        if(!deletedOffer) {
            return res.status(400).json({message: "Error while deleting offer"});
        }

        return res.status(200).json({message: "Deleted offer successfully"});
        
    } catch (error: any) {
        logger.error(error.message);
        return res.status(500).json({message: "An unexpected error occurred. Please try again later."});
    }
});

export default router;