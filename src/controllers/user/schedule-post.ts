import { Request, Response, RequestHandler } from "express";
import { SocialPlatform } from '../../interfaces/social-scheduling';
import { SchedulerService } from '../../services/scheduler.service';
import { ResUtil } from "../../helper/response.helper";
import logger from "../../util/logger";

export const schedulePost: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { platform, content, scheduledTime, mediaUrls, socialAccountId } = req.body;

    if (!userId) {
        return ResUtil.unAuthorized({ res, message: "User not authenticated" });
    }

    if (!Object.values(SocialPlatform).includes(platform)) {
        return ResUtil.badRequest({
            res,
            message: "Invalid social media platform"
        });
    }

    try {
        const jobId = await SchedulerService.schedulePost(
            platform,
            socialAccountId,
            content,
            new Date(scheduledTime),
            mediaUrls
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

export const getScheduledPosts: RequestHandler = async (req: Request, res: Response) => {
    try {
        const posts = SchedulerService.getScheduledPosts();
        return ResUtil.success({
            res,
            message: "Scheduled posts retrieved successfully",
            data: posts
        });
    } catch (error: any) {
        return ResUtil.internalError({
            res,
            message: `Error fetching scheduled posts: ${error.message}`
        });
    }
};

export const cancelScheduledPost: RequestHandler = async (req: Request, res: Response) => {
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