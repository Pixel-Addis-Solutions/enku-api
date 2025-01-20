import { Request, Response, RequestHandler } from 'express';
import { FacebookService, getFacebookUserId } from '../../services/facebook.service';
import { ResUtil } from '../../helper/response.helper';
import logger from '../../util/logger';
import { getRepository } from '../../data-source';
import { User } from '../../entities/user';
import { SocialAccount } from "../../entities/social-account";
/**
 * Create a Facebook Post
 */
export const createFacebookPost: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { message, link, image, scheduledTime } = req.body;

    if (!userId) {
        return ResUtil.unAuthorized({ res, message: "User not authenticated" });
    }

    try {
        const facebookService = new FacebookService();
        const result = await facebookService.createPost(userId, {
            message,
            link,
            image,
            scheduledTime: scheduledTime ? new Date(scheduledTime) : undefined
        });

        return ResUtil.success({
            res,
            message: "Posted to Facebook successfully",
            data: result
        });
    } catch (error: any) {
        logger.error("Error posting to Facebook", { error: error.message, stack: error.stack });
        return ResUtil.internalError({
            res,
            message: `Error posting to Facebook: ${error.message}`,
            data: error
        });
    }
};

/**
 * Get Facebook Page Details
 */
export const getFacebookPageDetails: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        return ResUtil.unAuthorized({ res, message: "User not authenticated" });
    }

    try {
        const facebookService = new FacebookService();
        const details = await facebookService.getPageDetails(userId);

        return ResUtil.success({
            res,
            message: "Facebook page details retrieved successfully",
            data: details
        });
    } catch (error: any) {
        logger.error("Error getting Facebook page details", { error: error.message, stack: error.stack });
        return ResUtil.internalError({
            res,
            message: `Error getting Facebook page details: ${error.message}`,
            data: error
        });
    }
};

/**
 * Get Facebook Insights
 */
export const getFacebookInsights: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        return ResUtil.unAuthorized({ res, message: "User not authenticated" });
    }

    try {
        const facebookService = new FacebookService();
        const insights = await facebookService.getPageInsights(userId);

        return ResUtil.success({
            res,
            message: "Facebook insights retrieved successfully",
            data: insights
        });
    } catch (error: any) {
        logger.error("Error getting Facebook insights", { error: error.message, stack: error.stack });
        return ResUtil.internalError({
            res,
            message: `Error getting Facebook insights: ${error.message}`,
            data: error
        });
    }
};

/**
 * Link Facebook Account
 */
export const linkFacebookAccount: RequestHandler = async (req, res) => {
    const userId = req.user?.id;
    const { accessToken } = req.body;

    if (!userId) {
        return ResUtil.unAuthorized({ res, message: "User not authenticated" });
    }

    try {
        const userRepository = getRepository(User);
        const socialAccountRepository = getRepository(SocialAccount);

        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user) {
            return ResUtil.notFound({ res, message: "User not found" });
        }

        // Fetch the Facebook User ID (platformUserId)
        const platformUserId = await getFacebookUserId(accessToken);

        // Check if this platformUserId is already linked
        const existingAccount = await socialAccountRepository.findOne({
            where: { platform: "facebook", platformUserId },
        });

        if (existingAccount) {
            return ResUtil.badRequest({
                res,
                message: "Facebook account already linked by another user",
            });
        }

        // Save the new social account
        const newAccount = socialAccountRepository.create({
            user,
            platform: "facebook",
            accountName: "Facebook Account", // Or fetch the actual account name from the API
            platformUserId,
            accountId: platformUserId, // Optional: Store as accountId as well
            accessToken,
            tokenExpiration: null, // Populate if available from the API
            refreshToken: null, // Populate if available from the API
        });

        await socialAccountRepository.save(newAccount);

        return ResUtil.success({
            res,
            message: "Facebook account linked successfully",
            data: { platformUserId },
        });
    } catch (error: any) {
        logger.error("Error linking Facebook account", {
            userId,
            error: error.message,
            stack: error.stack,
        });
        return ResUtil.internalError({
            res,
            message: `Error linking social account: ${error.message}`,
        });
    }
};