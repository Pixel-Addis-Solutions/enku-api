import { Request, Response } from 'express';
import { getRepository } from '../../data-source';
import { SocialAccount } from '../../entities/social-account';
import { InstagramService } from '../../services/instagram.service';
import { ResUtil } from '../../helper/response.helper';
import logger from '../../util/logger';
import { SchedulerService } from '../../services/scheduler.service';

// Initialize InstagramService
const instagramService = new InstagramService();


// Create an Instagram post
export const createInstagramPost = async (req: Request, res: Response) => {
    const userId = req.user?.id; // Ensure the user is authenticated
    const { caption, imageUrl, scheduledTime } = req.body;

    // Log the userId for debugging
    logger.info(`Received request to create Instagram post for user ID: ${userId}`, {
        type: typeof userId,
        value: userId,
    });

    if (!userId) {
        return ResUtil.unAuthorized({ res, message: 'User not authenticated' });
    }

    // Validate userId (ensure it's a non-empty string)
    if (typeof userId !== 'string' || userId.trim() === '') {
        return ResUtil.badRequest({
            res,
            message: 'Invalid user ID: must be a valid UUID string',
        });
    }

    try {
        const instagramService = new InstagramService();
        const result = await instagramService.createPost(
            userId, // Pass the userId as a string
            caption,
            imageUrl,
            scheduledTime ? new Date(scheduledTime) : undefined
        );

        return ResUtil.success({
            res,
            message: 'Posted to Instagram successfully',
            data: result,
        });
    } catch (error: any) {
        logger.error('Error posting to Instagram', {
            userId,
            error: error.message,
            stack: error.stack,
            originalError: error
        });

        if (error.message === 'No Instagram account linked to this user') {
            return ResUtil.badRequest({
                res,
                message: 'No Instagram account linked to this user',
            });
        }

        if (error.message.includes('Unknown column')) {
            return ResUtil.internalError({
                res,
                message: 'Database error occurred while fetching social account',
                data: { error: error.message }
            });
        }

        return ResUtil.internalError({
            res,
            message: `Error posting to Instagram: ${error.message}`,
            data: { error: error.message, stack: error.stack }
        });
    }
};

// Fetch Instagram media
export const fetchMedia = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        return ResUtil.unAuthorized({ res, message: 'User not authenticated' });
    }

    try {
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
    const userId = req.user?.id;

    if (!userId) {
        return ResUtil.unAuthorized({ res, message: 'User not authenticated' });
    }

    try {
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

// Schedule a post on Instagram
export const schedulePost = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { content, scheduledTime } = req.body;

    if (!userId) {
        return ResUtil.unAuthorized({ res, message: "User not authenticated" });
    }

    try {
        const socialAccountRepo = getRepository(SocialAccount);
        const socialAccount = await socialAccountRepo.findOne({
            where: { user: { id: userId }, platform: 'instagram', isActive: true },
        });

        if (!socialAccount) {
            return ResUtil.badRequest({
                res,
                message: "No linked Instagram account found"
            });
        }

        const accessToken = socialAccount.accessToken;

        // Schedule the post using InstagramService or similar service
        const jobId = await SchedulerService.schedulePost(
            socialAccount.platform,
            socialAccount.id,
            content,
            new Date(scheduledTime),
            accessToken
        );

        return ResUtil.success({
            res,
            message: "Post scheduled successfully",
            data: { jobId }
        });
    } catch (error: any) {
        logger.error("Error scheduling post", {
            error: error.message,
            stack: error.stack
        });
        return ResUtil.internalError({
            res,
            message: `Error scheduling post: ${error.message}`
        });
    }
};

// Cancel a scheduled post
export const cancelScheduledPost = async (req: Request, res: Response) => {
    const { jobId } = req.params;

    try {
        const cancelled = SchedulerService.cancelScheduledPost(jobId);
        
        if (!cancelled) {
            return ResUtil.notFound({
                res,
                message: "Scheduled post not found"
            });
        }

        return ResUtil.success({
            res,
            message: "Scheduled post cancelled successfully"
        });
    } catch (error: any) {
        return ResUtil.internalError({
            res,
            message: `Error cancelling scheduled post: ${error.message}`
        });
    }
};