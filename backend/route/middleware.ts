import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

interface JwtPayload {
    email: string,
    userId: string
}

declare global {
    namespace Express {
        interface Request {
            authEmail?: string; // Define your custom property here
        }
    }
}


export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const bearerToken = req.headers.authorization;
    if (!bearerToken || !bearerToken.startsWith('Bearer ')) {
        return res.status(401).send({ message: 'Authentication failed: Token not found or invalid' });
    }
    const authToken = bearerToken.split(' ')[1];

    jwt.verify(authToken, config.auth.jwtSecret, (err, decoded)=> {
        if(err || !decoded) {
            return res.status(401).send({ message: 'Authentication failed, Invalid token' });
        }
        const { email } = decoded as JwtPayload;
        req.authEmail = email;
        // const mail = req.authEmail || 'Guest';
        // logger.info(mail);
        next();
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
            logger.error(error.message);
            return res.status(401).json({message: error.message});
        }
    } 
}
