import passport from 'passport';
import {Strategy as GoogleStrategy} from 'passport-google-oauth20';
import { User } from './models/userModel';
import { PrismaClient } from '@prisma/client';
// import { profile } from 'console';
// import { doesNotMatch } from 'assert';
// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;

if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID is missing in environment variables.");
}
  
if (!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("GOOGLE_CLIENT_SECRET is missing in environment variables.");
}

const prisma = new PrismaClient();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/auth/google/callback',
            // callbackURL: 'http://localhost:5173/',
        },
        async (accessToken: any, refreshToken: any, profile: any, done: any) => {
            try {
                let user = await prisma.userinfo.findUnique({ 
                    where: { googleId: profile.id }
                });
                if(!user) {
                    user = await prisma.userinfo.create({
                        data: {
                            googleId: profile.id,
                            email: profile.emails[0].value,
                            first_name: profile.displayName,
                            provider: "google",
                        },
                    });
                }
                return done(null, user);
            } catch(err) {
                return done(err, null);
            }
        }
    )
);


// Serialize and deserialize user (for session management)
passport.serializeUser((user: any, done: any) => done(null, user.id));
// passport.deserializeUser((id: any, done: any) => User.findById(id).then((user) => done(null, user)));
passport.deserializeUser(async (id: number, done: any) => {
    try {
      const user = await prisma.userinfo.findUnique({ where: { id } });
      done(null, user);
    } catch (err) {
      done(err, null);
    }
});
  