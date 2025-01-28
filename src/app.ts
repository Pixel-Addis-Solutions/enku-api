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
import { configureFacebookStrategy } from './config/passport-facebook';
import { configureInstagramStrategy } from './config/Passport-Instagram';

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

// Configure passport strategies
configureFacebookStrategy(passport);
configureInstagramStrategy(passport);

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