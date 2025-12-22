import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface JwtPayload {
    email: string,
    userId: string,
    type: string
}

declare global {
    namespace Express {
        interface Request {
            authEmail?: string; // Define your custom property here
            userId?: number;
        }
    }
}


export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const bearerToken = req.headers.authorization;
    if (!bearerToken || !bearerToken.startsWith('Bearer ')) {
        return res.status(401).send({ message: 'Authentication failed: Token not found or invalid' });
    }
    const authToken = bearerToken.split(' ')[1];

    jwt.verify(authToken, config.auth.jwtSecret, async (err, decoded)=> {
        if(err || !decoded) {
            return res.status(401).send({ message: 'Authentication failed: Invalid token' });
        }
        
        const { email, userId, type } = decoded as JwtPayload;
        const parsedUserId = Number(userId);

        if(type === 'login' && userId && email && !isNaN(parsedUserId)) {
            try {
                const user = await prisma.userinfo.findUnique({
                    where: { email: email },
                    select: { id: true }
                });

                if(!user) {
                    return res.status(401).json({ message: 'Authentication failed: user not found'});
                }

                req.authEmail = email;
                req.userId = user.id;
                next();
            } catch (error: any) {
                logger.error(`Database error in authMiddleware: ${error.message}`);
                return res.status(500).json({ message: 'Authentication failed: Internal server error'});
            }
        } else {
            return res.status(401).json({ message: 'Authentication failed: invalid token'});
        }
    });
    
}

export const roleMiddleware = (allowedRoles: string[]) => {

    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // First authenticate the user and then check for addmin role
            authMiddleware(req, res, async () => {
                    const user = await prisma.userinfo.findUnique({
                        where: {
                            email: req.authEmail
                        }, 
                        select: {
                            id: true,
                            role: true,
                            email: true,
                        }
                    });

                    if(!user) {
                        return res.status(401).json({message: "Authentication failed"});
                    }
                    
                    if(!allowedRoles.includes(user.role)) {
                        logger.error(`Access denied for ${user.email}`);
                        return res.status(403).json({message: "Access denied!"});
                    }

                    next();        
                }
            );
        } catch(error: any) {
            logger.error(`Authorization failed: ${error.message}`);
            return res.status(401).json({message: error.message});
        }
    } 
}

export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    req.authEmail = undefined;
    req.userId = undefined;
    const bearerToken = req.headers.authorization;
    
    if (!bearerToken || !bearerToken.startsWith('Bearer ')) {
        return next();
    }

    const authToken = bearerToken.split(' ')[1];
    
    jwt.verify(authToken, config.auth.jwtSecret, async (err, decoded)=> {

        if(err || !decoded) {
            return next();
        }

        const { email, userId, type } = decoded as JwtPayload;
        const parsedUserId = Number(userId);

        if(type === 'login' && userId && email && !isNaN(parsedUserId)) {
            try {
                const user = await prisma.userinfo.findUnique({
                    where: {
                        email: email
                    }, 
                    select: {
                        id: true
                    }
                });

                if(user) {
                    req.authEmail = email;
                    req.userId = parsedUserId;
                } 
            } catch(error: any) {
                logger.info(`Authentication failed for ${email}`);
            }
        }

        next();
    });
}