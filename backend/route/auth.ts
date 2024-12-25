import express from 'express';
import passport from 'passport';
// import GoogleStrategy from 'passport-google-oidc';
import { Strategy as GoogleStrategy } from 'passport-google-oidc';
import { PrismaClient } from '@prisma/client';
import { error } from 'console';

const prisma = new PrismaClient();
const router = express.Router();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    callbackURL: '/auth/oauth2/redirect/google',
    scope: ['profile', 'email']
    }, async function verify(issuer: any, profile: any, done: (arg0: any, arg1: any) => any) {
        // console.log("GOOGLE_STRATEGY");
        // console.log(profile);
        // console.log(profile.emails[0].value);

        // check if use exists in db, if yes then return it, if not create new and return
        try {
            const user = await prisma.userinfo.findUnique({
                where: {
                    googleId: profile.id,
                }
            });

            if(!user) {
                const newUser = await prisma.userinfo.create({
                    data: {
                        email: profile.emails[0].value,
                        googleId: profile.id,
                        provider: 'google',
                        role: 'USER',
                    }
                });
                return done(null, newUser);
            } else {
                return done(null, user);
            }
        } catch(err) {
            return done(error, null);
        }
    }));

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

passport.serializeUser((user: any, done: any) => done(null, user.id));
passport.deserializeUser(async (id: number, done: any) => {
    try {
      const user = await prisma.userinfo.findUnique({ where: { id } });
      done(null, user);
    } catch (err) {
      done(err, null);
    }
});


router.get('/login/federated/google', passport.authenticate('google'));

router.get('/oauth2/redirect/google', passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/login',
}));

router.get('/login', function(req, res, next) {
    res.render('login');
});

router.get('/logout', function(req, res, next) {
    req.logout(function(err) {
        if(err) {
            return next(err);
        }
        res.redirect('/');
    });
});


export default router;
