import { Strategy as FacebookStrategy } from 'passport-facebook';
import { getRepository } from '../data-source';
import { SocialAccount } from '../entities/social-account';
import { User } from '../entities/user';

export const configureFacebookStrategy = (passport: any) => {
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID!,
        clientSecret: process.env.FACEBOOK_APP_SECRET!,
        callbackURL: "http://localhost:5000/user/social/facebook/callback",
        profileFields: ['id', 'emails', 'name', 'picture'],
        passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
        try {
            const socialAccount = {
                accessToken,
                refreshToken,
                platformUserId: profile.id,
                accountName: profile.displayName,
                emails: profile.emails,
                platform: 'facebook'
            };

            // If the user is logged in, link the Facebook account to the existing user
            if (req.user) {
                return done(null, { ...socialAccount, id: req.user.id });
            }

            // For standalone login, create a new user
            return done(null, socialAccount);
        } catch (error) {
            return done(error, null);
        }
    }));
};