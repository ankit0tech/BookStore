import express, {Request, Response} from "express";
import { PrismaClient } from "@prisma/client";
import { logger } from "../utils/logger.js";
import { roleMiddleware } from "./middleware.js";
import { adminUserUpdateZod } from "../zod/userZod.js";

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', roleMiddleware(['admin', 'superadmin']), async (req: Request, res: Response) => {
    try {
        const cursor: number = Number(req.query.cursor) || 0;
        const searchQuery: string|undefined = req.query.searchQuery as string|undefined;
        const trimmedQuery = searchQuery?.trim();
        let nextCursor = undefined;
        const filterUserRole: ''|'user'|'admin'|'superadmin'|undefined = req.query.filterUserRole as ''|'user'|'admin'|'superadmin'|undefined;
        
        const filterStatus: string|undefined = req.query.filterStatus as string|undefined;
        const filterDeactivated: boolean = (filterStatus === '' || filterStatus === null || filterStatus === undefined) ? false : true;
        const deactivatedStatus: boolean = filterStatus === 'deactivated' ? true : false;
        
        const filterVerifiedStatus: string|undefined = req.query.filterVerified as string|undefined;
        const filterVerified: boolean = (filterVerifiedStatus === '' || filterVerifiedStatus === null || filterVerifiedStatus === undefined) ? false : true;
        const verifiedStatus: boolean = filterVerifiedStatus === 'verified' ? true : false;
        

        const users = await prisma.userinfo.findMany({
            where: {
                ...(filterVerified && { verified: verifiedStatus }),
                ...(filterUserRole && { role: filterUserRole }),
                ...(filterDeactivated && { deactivated: deactivatedStatus }),
                ...(trimmedQuery && {
                    OR: [
                        {
                            email: {
                                contains: trimmedQuery,
                                mode: 'insensitive'
                            }
                        },
                        {
                            first_name: {
                                contains: trimmedQuery,
                                mode: 'insensitive'
                            }
                        },
                        {
                            last_name: {
                                contains: trimmedQuery,
                                mode: 'insensitive'
                            }
                        }
                    ]
                })
            },
            omit: {
                password: true,
                googleId: true,
            },
            orderBy: [
                { id: 'desc' }
            ],
            ...(cursor && {
                cursor: { id: cursor }
            }),
            take: 11
        });

        if(users.length > 10) {
            nextCursor = users[10].id;
            users.pop();
        }

        return res.status(200).json({
            users: users, 
            nextCursor: nextCursor
        });

    } catch(error: any) {
        logger.info(`Error while retrieving users ${error.message}`);
        return res.status(500).json({ message: 'An unexpected error occurred, please try again later' });
    }
});

router.get('/:id(\\d+)', roleMiddleware(['admin', 'superadmin']), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = await prisma.userinfo.findUnique({
            where: {
                id: Number(id)
            },
            omit: {
                password: true,
                googleId: true,
            }
        });

        return res.status(200).json({
            data: user
        });

    } catch(error: any) {

        if(error.code === 'P2025') {
            logger.info(`While updating user with ${req.params.id} not found`);
            return res.status(404).json({ message: `User with id ${req.params.id} not found` });
        }
        logger.info(`Error while retrieving users ${error.message}`);
        return res.status(500).json({ message: 'An unexpected error occurred, please try again later' });
    }
});

router.put('/:id(\\d+)', roleMiddleware(['admin', 'superadmin']), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = adminUserUpdateZod.safeParse(req.body);

        if(result.success) {
            const oldUser = await prisma.userinfo.findUnique({
                where: { 
                    id: Number(id) 
                },
                select: {
                    deactivated: true
                }
            });

            const updateDeactivatedAt: boolean = req.body.deactivated && (req.body.deactivated !== oldUser?.deactivated);

            const user = await prisma.userinfo.update({
                where: {
                    id: Number(id)
                },
                data: {
                        ...result.data,
                        deactivated_at: updateDeactivatedAt ? new Date() : undefined
                    },
                omit: {
                    password: true,
                    googleId: true,
                }
            });
            
            return res.status(200).json({
                message: `user with ${id} updated successfully`,
                data: user
            });

        } else {
            return res.status(400).json({
                message: 'Please send valid data',
                error: result.error.format()
            });
        }
        
    } catch(error: any) {
        
        if(error.code === 'P2025') {
            logger.info(`While updating user with ${req.params.id} not found`);
            return res.status(404).json({ message: `User with id ${req.params.id} not found` });
        }

        logger.info(`Error while retrieving users ${error.message}`);
        return res.status(500).json({ message: 'An unexpected error occurred, please try again later' });
    }
});

router.delete('/:id(\\d+)', roleMiddleware(['admin', 'superadmin']), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.userinfo.update({
            where: {
                id: Number(id)
            }, 
            data: {
                deactivated: true,
                deactivated_at: new Date()
            }
        });
        
        logger.info(`user with ${id} deleted by ${req.userId}`);
        return res.status(200).json({ message: `user with ${id} updated successfully` });
        
    } catch(error: any) {
        
        if(error.code === 'P2025') {
            logger.info(`While deleting user with ${req.params.id} not found`);
            return res.status(404).json({ message: `User with id ${req.params.id} not found` });
        }

        logger.info(`Error while deleting users ${error.message}`);
        return res.status(500).json({ message: 'An unexpected error occurred, please try again later' });
    }
});

router.get('/user-stats', roleMiddleware(['admin', 'superadmin']), async (req: Request, res: Response) => {
    try {
        const [totalUsers, activeUsers, verifiedUsers, normalUsers, adminUsers, superadminUsers] = await Promise.all([
            prisma.userinfo.count({ where: {} }),
            prisma.userinfo.count({ where: { deactivated: false } }),
            prisma.userinfo.count({ where: { verified: true } }),
            prisma.userinfo.count({ where: { role: 'user' } }),
            prisma.userinfo.count({ where: { role: 'admin' } }),
            prisma.userinfo.count({ where: { role: 'superadmin' } }),
        ]);

        return res.status(200).json({ totalUsers, activeUsers, verifiedUsers, normalUsers, adminUsers, superadminUsers });

    } catch(error: any) {
        logger.error(`Error while retrieveing user-stats ${error.message}`);
        return res.status(500).json({ message: 'An unexpected error occurred, please try again later' });
    }
});


export default router;