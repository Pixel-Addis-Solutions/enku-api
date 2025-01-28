import { Request, Response } from 'express';
import { getRepository } from "../../data-source";
import { SocialAccount } from '../../entities/social-account'; // Adjust the import path
import { InstagramService } from '../../services/instagram.service'; // Adjust the import path
import { ResUtil } from '../../helper/response.helper'; // Adjust the import path
import logger from '../../util/logger'; // Adjust the import path

// Initialize InstagramService
const instagramService = new InstagramService();

// Handle Instagram callback
export const handleCallback = async (req: Request, res: Response) => {
    try {
        const socialData = req.user as any;

        if (!socialData) {
            return ResUtil.badRequest({ res, message: 'No social data provided' });
        }

        let result;
        if (req.user && (req.user as any).id) {
            // Link account to existing user
            result = await instagramService.linkAccount(
                (req.user as any).id,
                socialData
            );
        } else {
            // Create new user from Instagram data
            result = await instagramService.createUserFromInstagram(socialData);
        }

        return ResUtil.success({
            res,
            message: 'Instagram authentication successful',
            data: result
        });
    } catch (error: any) {
        logger.error('Error handling Instagram callback', {
            error: error.message,
            stack: error.stack,
        });
        return ResUtil.internalError({
            res,
            message: error.message || 'Instagram authentication failed',
            data: error
        });
    }
}

// Create an Instagram post
export const createInstagramPost = async (req: Request, res: Response) => {
    const userId = req.user?.id; // Ensure the user is authenticated
    const { caption, imageUrl, scheduledTime } = req.body;

    if (!userId) {
        return ResUtil.unAuthorized({ res, message: 'User not authenticated' });
    }

    try {
        // Fetch the linked Instagram account from the database
        const socialAccountRepo = getRepository(SocialAccount);
        const socialAccount = await socialAccountRepo.findOne({
            where: { user: { id: userId }, platform: 'instagram', isActive: true },
        });

        if (!socialAccount) {
            return ResUtil.badRequest({
                res,
                message: 'User does not have a linked Instagram account',
            });
        }

        const accessToken = socialAccount.accessToken;
        const instagramService = new InstagramService();

        // Log the access token being used
        logger.info(`Using access token: ${accessToken}`);

        // Call createPost with all required arguments
        const result = await instagramService.createPost(
            accessToken, // Required
            caption,     // Required
            imageUrl,    // Required
            scheduledTime ? new Date(scheduledTime) : undefined // Optional
        );

        return ResUtil.success({
            res,
            message: 'Posted to Instagram successfully',
            data: result,
        });
    } catch (error: any) {
        logger.error('Error posting to Instagram', {
            error: error.message,
            stack: error.stack,
        });
        return ResUtil.internalError({
            res,
            message: `Error posting to Instagram: ${error.message}`,
            data: error,
        });
    }
};

// Fetch Instagram media
export const fetchMedia = async (req: Request, res: Response) => {
    const userId = req.user?.id; // Ensure the user is authenticated

    if (!userId) {
        return ResUtil.unAuthorized({ res, message: 'User not authenticated' });
    }

    try {
        // Fetch the linked Instagram account from the database
        const socialAccountRepo = getRepository(SocialAccount);
        const socialAccount = await socialAccountRepo.findOne({
            where: { user: { id: userId }, platform: 'instagram', isActive: true },
        });

        if (!socialAccount) {
            return ResUtil.badRequest({
                res,
                message: 'User does not have a linked Instagram account',
            });
        }

        const accessToken = socialAccount.accessToken;

        // Log the access token being used
        logger.info(`Using access token: ${accessToken}`);

        // Fetch media using the InstagramService
        const result = await instagramService.fetchMedia(accessToken);
        return ResUtil.success({
            res,
            message: 'Instagram media fetched successfully',
            data: result,
        });
    } catch (error: any) {
        logger.error('Error fetching Instagram media', {
            error: error.message,
            stack: error.stack,
        });
        return ResUtil.internalError({
            res,
            message: error.message || 'Failed to fetch Instagram media',
            data: error,
        });
    }
};

// Get Instagram user profile
export const getUserProfile = async (req: Request, res: Response) => {
    const userId = req.user?.id; // Ensure the user is authenticated

    if (!userId) {
        return ResUtil.unAuthorized({ res, message: 'User not authenticated' });
    }

    try {
        // Fetch the linked Instagram account from the database
        const socialAccountRepo = getRepository(SocialAccount);
        const socialAccount = await socialAccountRepo.findOne({
            where: { user: { id: userId }, platform: 'instagram', isActive: true },
        });

        if (!socialAccount) {
            return ResUtil.badRequest({
                res,
                message: 'User does not have a linked Instagram account',
            });
        }

        const accessToken = socialAccount.accessToken;

        // Log the access token being used
        logger.info(`Using access token: ${accessToken}`);

        // Fetch user profile using the InstagramService
        const result = await instagramService.getUserProfile(accessToken);
        return ResUtil.success({
            res,
            message: 'Instagram profile fetched successfully',
            data: result,
        });
    } catch (error: any) {
        logger.error('Error fetching Instagram profile', {
            error: error.message,
            stack: error.stack,
        });
        return ResUtil.internalError({
            res,
            message: error.message || 'Failed to fetch Instagram profile',
            data: error,
        });
    }
};