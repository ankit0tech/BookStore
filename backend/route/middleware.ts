import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { PrismaClient } from '@prisma/client';

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
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).send({ message: 'Authentication failed, Token not found' });
    }

    jwt.verify(token, config.auth.jwtSecret, (err, decoded)=> {
        if(err || !decoded) {
            return res.status(401).send({ message: 'Authentication failed, Invalid token' });
        }
        const { email } = decoded as JwtPayload;
        req.authEmail = email;
        // const mail = req.authEmail || 'Guest';
        // console.log(mail);
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
                        console.log(`Access denied for ${user.email}`);
                        return res.status(403).json({message: "Access denied!"});
                    }
                    
                    next();        
                }
            );
        
        } catch(error: any) {
            console.log(error.message);
            return res.status(401).json({message: error.message});
        }
    } 
}
