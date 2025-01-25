import express from 'express';
import passport from 'passport';
import { authenticate } from '../../middlewares/customer-login';
import { FacebookService } from '../../services/facebook.service';
import { SocialAccount } from '../../entities/social-account';
import { getRepository } from '../../data-source';
import { ResUtil } from '../../helper/response.helper';
import logger from '../../util/logger';
import { User } from '../../entities/user';

const router = express.Router();

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
                    socialAccount.platformSettings = {
                        ...socialAccount.platformSettings,
                        pages
                    };
                } else {
                    // Create new account
                    socialAccount = socialAccountRepo.create({
                        user: { id: userId },
                        platform: 'facebook',
                        accountName: fbProfile.displayName || '',
                        platformUserId: fbProfile.id,
                        accessToken: fbProfile.accessToken,
                        refreshToken: fbProfile.refreshToken,
                        isActive: true,
                        platformSettings: {
                            pages
                        }
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
                    isActive: true,
                    platformSettings: {
                        pages
                    }
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

export default router;