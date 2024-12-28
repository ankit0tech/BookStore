import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

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