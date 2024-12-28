import express from 'express';
import passport from 'passport';
// import GoogleStrategy from 'passport-google-oidc';
import { Strategy as GoogleStrategy } from 'passport-google-oidc';
import { PrismaClient } from '@prisma/client';
import { error } from 'console';
// import { JWT, LoginTicket, OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const router = express.Router();
// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
import { config } from '../config';


// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID || "",
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
//     // callbackURL: '/auth/oauth2/redirect/google',
//     callbackURL: 'http://localhost:5173/auth/oauth2/redirect/google',
//     scope: ['profile', 'email']
//     }, async function verify(issuer: any, profile: any, done: (arg0: any, arg1: any) => any) {
//         // console.log("GOOGLE_STRATEGY");
//         // console.log(profile);
//         // console.log(profile.emails[0].value);

//         // check if user exists in db, if yes then return it, if not create new and return
//         try {
//             const user = await prisma.userinfo.findUnique({
//                 where: {
//                     googleId: profile.id,
//                 }
//             });

//             if(!user) {
//                 const newUser = await prisma.userinfo.create({
//                     data: {
//                         email: profile.emails[0].value,
//                         googleId: profile.id,
//                         provider: 'google',
//                         role: 'USER',
//                     }
//                 });
//                 return done(null, newUser);
//             } else {
//                 return done(null, user);
//             }
//         } catch(err) {
//             return done(error, null);
//         }
//     }));

// passport.serializeUser(function(user, cb) {
//     process.nextTick(function() {
//         cb(null, { id: user.id, username: user.username, name: user.name });
//     })
// })

// passport.deserializeUser(function(user, cb) {
//     process.nextTick(function() {
//       return cb(null, user);
//     });
//   });

// passport.serializeUser((user: any, done: any) => done(null, user.id));
// passport.deserializeUser(async (id: number, done: any) => {
//     try {
//       const user = await prisma.userinfo.findUnique({ where: { id } });
//       done(null, user);
//     } catch (err) {
//       done(err, null);
//     }
// });


// router.get('/login/federated/google', passport.authenticate('google', {
//     scope: ['profile', 'email']
// }));

// router.get('/login/federated/google', async (req, res) => {
//     const { credential } = req.body;

//     try {
//         const ticket = await client.verifyIdToken({})
//     }
// });


router.post('/login/federated/google', async (req, res) => {

    console.log('/login/federated/google Verifying the token');
    const { tokenId } = req.body;
    console.log('TOKEN: ', tokenId);

    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo',
            {
                headers: {
                    Authorization: `Bearer ${tokenId}`,
                },
            }
        );

        const payload = await response.json();
        if (!payload?.email) {
            return res.status(401).json({ success: false });
        }
        const googleId = payload.sub;
        let user = await prisma.userinfo.findUnique({
            where: {
                googleId: googleId,
            }
        });

        if(!user) {
            user = await prisma.userinfo.create({
                data: {
                    email: payload.email,
                    googleId: googleId,
                    provider: 'google',
                    role: 'USER',
                }
            });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role , email: user.email },
            config.auth.jwtSecret,
            { expiresIn: '1h' }
        );


        // const ticket = await client.verifyIdToken({
        //     idToken: tokenId,
        //     audience: process.env.GOOGLE_CLIENT_ID,
        // });
        // const payload = ticket.getPayload();
        // if (!payload?.email) {
        //     return res.status(401).json({ success: false });
        // }

        // const googleId = payload?.sub;
        
        // let user = await prisma.userinfo.findUnique({
        //     where: {
        //         googleId: googleId,
        //     }
        // });

        // // if (!payload || !payload.email) {
        // //     return res.status(401).json({ failure: "Issue with authentication" });
        // // }

        // if(!user) {
        //     user = await prisma.userinfo.create({
        //         data: {
        //             email: payload.email,
        //             googleId: googleId,
        //             provider: 'google',
        //             role: 'USER',
        //         }
        //     });
        // }

        // const token = jwt.sign(
        //     { userId: user.id, role: user.role , email: user.email },
        //     JWT_SECRET,
        //     { expiresIn: '1h' }
        // );

        res.status(200).json({ success: true, token });
        
    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
});

// router.get('/oauth2/redirect/google', passport.authenticate('google', 
//     // {
//     //     successRedirect: '/',
//     //     failureRedirect: '/login',
//     // },
//     { session: false }),
//     (req, res) => {
//         const user = req.user as any;

//         const token = jwt.sign(
//             { userId: user.id, role: user.role },
//             JWT_SECRET,
//             { expiresIn: '1h'}
//         );

//         res.redirect(`http://localhost:5173/oauth-callback?token=${token}`);
//     }
// );

// router.get('/login', function(req, res, next) {
//     res.render('login');
// });

router.get('/logout', function(req, res, next) {
    try {
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            messgae: 'Logout failed'
        });
    }
});


export default router;
