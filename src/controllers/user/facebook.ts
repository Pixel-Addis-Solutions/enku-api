import { Request, Response, RequestHandler } from 'express';
import { FacebookService } from '../../services/facebook.service';
import { ResUtil } from '../../helper/response.helper';
import logger from '../../util/logger';
import { getRepository } from 'typeorm';
import { User } from '../../entities/user';

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
        logger.error("Error posting to Facebook", error);
        return ResUtil.internalError({
            res,
            message: `Error posting to Facebook: ${error.message}`,
            data: error
        });
    }
};

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
        logger.error("Error getting Facebook page details", error);
        return ResUtil.internalError({
            res,
            message: `Error getting Facebook page details: ${error.message}`,
            data: error
        });
    }
};

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
        logger.error("Error getting Facebook insights", error);
        return ResUtil.internalError({
            res,
            message: `Error getting Facebook insights: ${error.message}`,
            data: error
        });
    }
};

export const linkFacebookAccount: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { accessToken } = req.body;

    if (!userId) {
        return ResUtil.unAuthorized({ res, message: "User not authenticated" });
    }

    try {
        // First verify user exists
        const userRepository = getRepository(User);
        const user = await userRepository.findOne({ where: { id: userId } });

        if (!user) {
            logger.error('User not found in database:', { userId });
            return ResUtil.notFound({
                res,
                message: "User not found",
                data: { userId }
            });
        }

        const facebookService = new FacebookService();
        await facebookService.linkAccount(user.id, accessToken); // Pass verified user ID

        return ResUtil.success({
            res,
            message: "Facebook account linked successfully",
            data: {}
        });
    } catch (error: any) {
        logger.error("Error linking Facebook account", {
            userId,
            error: error.message,
            stack: error.stack
        });
        return ResUtil.internalError({
            res,
            message: `Error linking social account: ${error.message}`,
            data: {}
        });
    }
}; 