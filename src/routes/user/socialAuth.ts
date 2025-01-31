import express from 'express';
import passport from 'passport';
import { authenticate } from '../../middlewares/customer-login';
import { FacebookService } from '../../services/facebook.service';
import { SocialAccount } from '../../entities/social-account';
import { getRepository } from '../../data-source';
import { ResUtil } from '../../helper/response.helper';
import logger from '../../util/logger';
import { User } from '../../entities/user';
import { InstagramService } from '../../services/instagram.service';
import { TokenData } from '../../types/express';

const router = express.Router();

// Function to refresh access tokens before they expire
const refreshAccessTokenIfNeeded = async (socialAccount: SocialAccount) => {
    const now = new Date();
    const tokenExpiration = new Date(socialAccount.tokenExpiration || 0);

    if (tokenExpiration < now) {
        try {
            let newTokenData: TokenData | undefined;
            if (socialAccount.platform === 'facebook') {
                newTokenData = await FacebookService.refreshAccessToken(socialAccount.accessToken);
            } else if (socialAccount.platform === 'instagram') {
                newTokenData = await InstagramService.refreshAccessToken(socialAccount.accessToken);
            }

            if (newTokenData) {
                socialAccount.accessToken = newTokenData.access_token;
                socialAccount.refreshToken = newTokenData.refresh_token || socialAccount.refreshToken;
                socialAccount.tokenExpiration = new Date(now.getTime() + newTokenData.expires_in * 1000);
                await getRepository(SocialAccount).save(socialAccount);
            }
        } catch (error: any) {
            logger.error('Error refreshing access token', {
                error: error.message,
                stack: error.stack,
                accountId: socialAccount.id
            });
            throw error;
        }
    }
};

// Initiate Facebook OAuth flow
router.get('/auth/facebook/login', (req, res, next) => {
    const redirectUri = "http://localhost:5000/user/social/facebook/callback";
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${redirectUri}&scope=email,pages_show_list,pages_manage_posts`;
    
    console.log("OAuth URL:", authUrl); // Log the OAuth URL
    res.redirect(authUrl);
});

// Facebook OAuth callback (handles both linking and standalone login)
router.get('/facebook/callback', 
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    async (req, res) => {
        try {
            const userId = req.user?.id; // For linking to an existing account
            const fbProfile = req.user as any; // Change type to 'any' for flexibility

            if (!fbProfile) {
                logger.error('Facebook authentication failed: No profile data received');
                return res.redirect('/error?message=authentication_failed');
            }

            const socialAccountRepo = getRepository(SocialAccount);

            // Fetch connected pages
            const pages = await FacebookService.getPages(fbProfile.accessToken);

            let socialAccount;
            if (userId) {
                // Linking to an existing account
                socialAccount = await socialAccountRepo.findOne({
                    where: {
                        user: { id: userId },
                        platform: 'facebook'
                    }
                });

                if (socialAccount) {
                    // Update existing account
                    socialAccount.accessToken = fbProfile.accessToken;
                    socialAccount.refreshToken = fbProfile.refreshToken;
                    socialAccount.accountName = fbProfile.displayName || '';
                    socialAccount.platformUserId = fbProfile.id;
                    socialAccount.tokenExpiresAt = new Date(Date.now() + fbProfile.expires_in * 1000);
                } else {
                    // Create new account
                    socialAccount = socialAccountRepo.create({
                        user: { id: userId },
                        platform: 'facebook',
                        accountName: fbProfile.displayName || '',
                        platformUserId: fbProfile.id,
                        accessToken: fbProfile.accessToken,
                        refreshToken: fbProfile.refreshToken,
                        tokenExpiresAt: new Date(Date.now() + fbProfile.expires_in * 1000),
                        isActive: true,
                    });
                }
            } else {
                // Standalone login - create a new user and social account
                const userRepo = getRepository(User);
                const user = userRepo.create({ 
                    email: fbProfile.emails?.[0]?.value || '' 
                });
                await userRepo.save(user);

                socialAccount = socialAccountRepo.create({
                    user,
                    platform: 'facebook',
                    accountName: fbProfile.displayName || '',
                    platformUserId: fbProfile.id,
                    accessToken: fbProfile.accessToken,
                    refreshToken: fbProfile.refreshToken,
                    tokenExpiresAt: new Date(Date.now() + fbProfile.expires_in * 1000),
                    isActive: true,
                });
            }

            await socialAccountRepo.save(socialAccount);

            logger.info('Facebook account linked successfully', {
                userId: socialAccount.user.id,
                platform: 'facebook',
                accountId: socialAccount.id
            });

            res.redirect('/dashboard?message=account_linked');
        } catch (error: any) {
            logger.error('Error linking Facebook account', {
                error: error.message,
                stack: error.stack
            });
            res.redirect('/error?message=linking_failed');
        }
    }
);

// Unlink Facebook account
router.delete('/remove/facebook', authenticate, async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        return ResUtil.unAuthorized({ res, message: "User not authenticated" });
    }

    try {
        const socialAccountRepo = getRepository(SocialAccount);
        await socialAccountRepo.update(
            {
                user: { id: userId },
                platform: 'facebook',
                isActive: true
            },
            {
                isActive: false
            }
        );

        return ResUtil.success({
            res,
            message: "Facebook account unlinked successfully"
        });
    } catch (error: any) {
        logger.error('Error unlinking Facebook account', {
            error: error.message,
            stack: error.stack,
            userId
        });
        return ResUtil.internalError({
            res,
            message: "Error unlinking Facebook account"
        });
    }
});

// Initiate Instagram OAuth flow
router.get('/auth/instagram/login', (req, res) => {
    const redirectUri = "https://toll-lens-configuration-future.trycloudflare.com/user/social/instagram/callback"; // Your callback URI
    const clientId = process.env.INSTAGRAM_CLIENT_ID;
    
    // Use user-related scopes
    const scopes = "instagram_business_basic, instagram_business_manage_messages, instagram_business_content_publish, instagram_business_manage_insights,instagram_business_manage_comments";

    const authUrl = `https://www.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code`;
    
    logger.info('Instagram User OAuth URL generated', { url: authUrl });
    console.log("OAuth URL:", authUrl); // Log the OAuth URL
    res.redirect(authUrl);
});



// Instagram OAuth callback (handles both linking and standalone login)
router.get('/instagram/callback', 
    passport.authenticate('instagram', { failureRedirect: '/login' }),
    async (req, res) => {
        try {
            const userId = req.user?.id; // For linking to an existing account
            const instagramProfile = req.user as any; // Change type to 'any' for flexibility

            if (!instagramProfile) {
                logger.error('Instagram authentication failed: No profile data received');
                return res.redirect('/error?message=authentication_failed');
            }

            const socialAccountRepo = getRepository(SocialAccount);

            // Fetch Instagram user data (e.g., profile, media)
            const userData = await InstagramService.getUserProfile(instagramProfile.accessToken);

            let socialAccount;
            if (userId) {
                // Linking to an existing account
                socialAccount = await socialAccountRepo.findOne({
                    where: {
                        user: { id: userId },
                        platform: 'instagram'
                    }
                });

                if (socialAccount) {
                    // Update existing account
                    socialAccount.accessToken = instagramProfile.accessToken;
                    socialAccount.refreshToken = instagramProfile.refreshToken;
                    socialAccount.accountName = instagramProfile.username || '';
                    socialAccount.platformUserId = instagramProfile.id;
                    socialAccount.tokenExpiresAt = new Date(Date.now() + instagramProfile.expires_in * 1000);
                } else {
                    // Create new account
                    socialAccount = socialAccountRepo.create({
                        user: { id: userId },
                        platform: 'instagram',
                        accountName: instagramProfile.username || '',
                        platformUserId: instagramProfile.id,
                        accessToken: instagramProfile.accessToken,
                        refreshToken: instagramProfile.refreshToken,
                        tokenExpiresAt: new Date(Date.now() + instagramProfile.expires_in * 1000),
                        isActive: true,
                    });
                }
            } else {
                // Standalone login - create a new user and social account
                const userRepo = getRepository(User);
                const user = userRepo.create({ 
                    email: instagramProfile.emails?.[0]?.value || '' 
                });
                await userRepo.save(user);

                socialAccount = socialAccountRepo.create({
                    user,
                    platform: 'instagram',
                    accountName: instagramProfile.username || '',
                    platformUserId: instagramProfile.id,
                    accessToken: instagramProfile.accessToken,
                    refreshToken: instagramProfile.refreshToken,
                    tokenExpiresAt: new Date(Date.now() + instagramProfile.expires_in * 1000),
                    isActive: true,
                });
            }

            await socialAccountRepo.save(socialAccount);

            logger.info('Instagram account linked successfully', {
                userId: socialAccount.user.id,
                platform: 'instagram',
                accountId: socialAccount.id
            });

            res.redirect('/dashboard?message=account_linked');
        } catch (error: any) {
            logger.error('Error linking Instagram account', {
                error: error.message,
                stack: error.stack
            });
            res.redirect('/error?message=linking_failed');
        }
    }
);

// Unlink Instagram account
router.delete('/remove/instagram', authenticate, async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        return ResUtil.unAuthorized({ res, message: "User not authenticated" });
    }

    try {
        const socialAccountRepo = getRepository(SocialAccount);
        await socialAccountRepo.update(
            {
                user: { id: userId },
                platform: 'instagram',
                isActive: true
            },
            {
                isActive: false
            }
        );

        return ResUtil.success({
            res,
            message: "Instagram account unlinked successfully"
        });
    } catch (error: any) {
        logger.error('Error unlinking Instagram account', {
            error: error.message,
            stack: error.stack,
            userId
        });
        return ResUtil.internalError({
            res,
            message: "Error unlinking Instagram account"
        });
    }
});

export default router;