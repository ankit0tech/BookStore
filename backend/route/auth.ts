import express from 'express';
import passport from 'passport';
// import GoogleStrategy from 'passport-google-oidc';
// import { Strategy as GoogleStrategy } from 'passport-google-oidc';
import { PrismaClient } from '@prisma/client';
// import { error } from 'console';
// import { JWT, LoginTicket, OAuth2Client } from 'google-auth-library';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';

const prisma = new PrismaClient();
const router = express.Router();
// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
import { config } from '../config';
// import { json } from 'stream/consumers';

interface UserInfo {
    email: string;
    sub: string;
    [key: string]: any;
}

router.post('/login/federated/google', async (req, res) => {

    try {
        const token = req.body.token;
        
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const payload = await response.json() as UserInfo;
        
        if(!response.ok || !payload?.email) {
            return res.status(401).json({ success: false});
        }

        let user = await prisma.userinfo.findUnique({
            where: {
                email: payload.email,
            }
        });

        if (!user) {
            user = await prisma.userinfo.create({
                data: {
                    email: payload.email,
                    role: 'USER',
                    verified: true,
                    googleId: payload.sub,
                    provider: 'google'
                }
            });
        } else if (user.provider != 'google' && !user.googleId) {
            user = await prisma.userinfo.update({
                where: {
                    email: payload.email,
                },
                data: {
                    googleId: payload.sub,
                }
            });
        }

        const jwtToken = jwt.sign({
                email: user.email,
                userId: user.id,
                role: user.role
            },
            config.auth.jwtSecret,
            { expiresIn: '1h' }
        )

        return res.status(200).json({
            success: true,
            token: jwtToken
        })
    } catch (error) {
        console.log('Token verification failed: ', error);
        res.status(401).json({success: false, message: 'Invalid Token'});
    }
});

router.get('/logout', function(req, res, next) {
    try {
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Logout failed'
        });
    }
});


export default router;
