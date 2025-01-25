import express, { Application, Request, Response, NextFunction } from "express";
import "reflect-metadata";
import { AppDataSource } from "./data-source";
import logger from "./util/logger";
import { ResUtil } from "./helper/response.helper";
import routes from "./routes/index";
import * as Sentry from '@sentry/node';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session'; // Add session middleware
import passport from 'passport'; // Add Passport
import { Strategy as FacebookStrategy } from 'passport-facebook'; // Add Facebook strategy
import { SocialAccount } from "./entities/social-account"; // Adjust the path as needed
import { User } from "./entities/user"; // Adjust the path as needed

require('dotenv').config();

// Initialize Express app
const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Session middleware (required for Passport)
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key', // Use a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' } // Use secure cookies in production
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Facebook strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID!,
    clientSecret: process.env.FACEBOOK_APP_SECRET!,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL!,
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

// Serialize and deserialize user
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user as Express.User);
});

// Test route
app.get('/test', (req, res) => {
    res.send('API Working');
});

// Routes
app.use("/", routes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(`Unhandled error: ${err.message}`);
    ResUtil.internalError({ res, message: "Internal Server Error", data: err });
});

// Initialize database and start server
AppDataSource.initialize()
    .then(() => {
        app.listen(5000, () => {
            console.log('Server is running on port 5000');
        });
    })
    .catch((error) => console.log('Error: ', error));

export default app;