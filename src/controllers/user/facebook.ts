import { Request, Response, RequestHandler } from "express";
import { getRepository } from "../../data-source";
import { SocialAccount } from "../../entities/social-account";
import { FacebookService } from "../../services/facebook.service";
import { ResUtil } from "../../helper/response.helper";
import logger from "../../util/logger";
import { SchedulerService } from "../../services/scheduler.service";


// Helper to get the linked Facebook account for the user
const getLinkedFacebookAccount = async (userId: string) => {
  const socialAccountRepository = getRepository(SocialAccount);

  // Log the user ID
  logger.info(`Fetching linked Facebook account for userId: ${userId}`);

  const account = await socialAccountRepository.findOne({
    where: {
      user: { id: userId }, // Ensure this matches the `id` column in the `User` table
      platform: "facebook",
      isActive: true,
    },
  });

  // Log the result from the query
  if (account) {
    logger.info(`Linked Facebook Account: ${JSON.stringify(account)}`);
  } else {
    logger.warn(`No linked Facebook account found for userId: ${userId}`);
  }

  return account;
};

/**
 * Create a Facebook Post
 */
export const createFacebookPost: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.user?.id;  // Ensure the user is authenticated
    const { message, link, image, scheduledTime } = req.body;
  
    if (!userId) {
      return ResUtil.unAuthorized({ res, message: "User not authenticated" });
    }
  
    try {
      // Fetch the linked Facebook account from the database
      const socialAccountRepo = getRepository(SocialAccount);
      const socialAccount = await socialAccountRepo.findOne({
        where: { user: { id: userId }, platform: 'facebook', isActive: true }
      });
  
      if (!socialAccount) {
        return ResUtil.badRequest({
          res,
          message: "User does not have a linked Facebook account",
        });
      }
  
      const accessToken = socialAccount.accessToken;
      const facebookService = new FacebookService();
  
      // Log the access token being used
      logger.info(`Using access token: ${accessToken}`);
  
      // Create the post using the FacebookService
      const result = await facebookService.createPost(accessToken, {
        message,
        link,
        image,
        scheduledTime: scheduledTime ? new Date(scheduledTime) : undefined,
      });

      return ResUtil.success({
        res,
        message: "Posted to Facebook successfully",
        data: result,
      });
    } catch (error: any) {
      logger.error("Error posting to Facebook", {
        error: error.message,
        stack: error.stack,
      });
      return ResUtil.internalError({
        res,
        message: `Error posting to Facebook: ${error.message}`,
        data: error,
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

  const socialAccount = await getLinkedFacebookAccount(userId);

  if (!socialAccount) {
    return ResUtil.badRequest({
      res,
      message: "User does not have a linked Facebook account",
    });
  }

  try {
    const facebookService = new FacebookService();
    const details = await facebookService.getPageDetails(socialAccount.accessToken);

    return ResUtil.success({
      res,
      message: "Facebook page details retrieved successfully",
      data: details,
    });
  } catch (error: any) {
    logger.error("Error getting Facebook page details", {
      error: error.message,
      stack: error.stack,
    });
    return ResUtil.internalError({
      res,
      message: `Error getting Facebook page details: ${error.message}`,
      data: error,
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

  const socialAccount = await getLinkedFacebookAccount(userId);

  if (!socialAccount) {
    return ResUtil.badRequest({
      res,
      message: "User does not have a linked Facebook account",
    });
  }

  try {
    const facebookService = new FacebookService();
    const insights = await facebookService.getPageInsights(socialAccount.accessToken);

    return ResUtil.success({
      res,
      message: "Facebook insights retrieved successfully",
      data: insights,
    });
  } catch (error: any) {
    logger.error("Error getting Facebook insights", {
      error: error.message,
      stack: error.stack,
    });
    return ResUtil.internalError({
      res,
      message: `Error getting Facebook insights: ${error.message}`,
      data: error,
    });
  }
};

export const unlinkFacebookAccount: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    
    if (!userId) {
        return ResUtil.unAuthorized({ res, message: "User not authenticated" });
    }

    try {
        const socialAccountRepo = getRepository(SocialAccount);
        await socialAccountRepo.update(
            { user: { id: userId }, platform: 'facebook' },
            { isActive: false }
        );

        return ResUtil.success({
            res,
            message: "Facebook account unlinked successfully"
        });
    } catch (error: any) {
        logger.error("Error unlinking Facebook account", {
            error: error.message,
            stack: error.stack,
        });
        return ResUtil.internalError({
            res,
            message: `Error unlinking Facebook account: ${error.message}`
        });
    }
};

export const schedulePost: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { content, scheduledTime } = req.body;

    if (!userId) {
        return ResUtil.unAuthorized({ res, message: "User not authenticated" });
    }

    try {
        const socialAccount = await getLinkedFacebookAccount(userId);
        
        if (!socialAccount) {
            return ResUtil.badRequest({
                res,
                message: "No linked Facebook account found"
            });
        }

        const jobId = await SchedulerService.schedulePost(
            socialAccount.platform,
            socialAccount.id,
            content,
            new Date(scheduledTime)
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