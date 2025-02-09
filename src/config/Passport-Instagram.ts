import { Strategy as InstagramStrategy } from 'passport-instagram';
import { getRepository } from '../data-source';
import { SocialAccount } from '../entities/social-account';
import { User } from '../entities/user';
import { Request } from 'express';

export const configureInstagramStrategy = (passport: any) => {
    passport.use(new InstagramStrategy({
        clientID: process.env.INSTAGRAM_CLIENT_ID!,
        clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
        callbackURL: "http://localhost:5000/user/social/instagram/callback",
        scope: ['user_profile', 'user_media'],
        passReqToCallback: true
    } as any,
    async (req: Request, accessToken: string, refreshToken: string, profile: any, done: any) => {
        try {
            const socialAccount = {
                accessToken,
                refreshToken,
                platformUserId: profile.id,
                accountName: profile.username,
                emails: profile.emails,
                platform: 'instagram'
            };

            // If the user is logged in, link the Instagram account to the existing user
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