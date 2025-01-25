import { Request, Response, RequestHandler } from 'express';
import { getRepository } from '../../data-source';
import { SocialAccount } from '../../entities/social-account';
import { ResUtil } from '../../helper/response.helper';
import { SocialAuthService } from '../../services/social-auth.service';
import logger from "../../util/logger";

// Update the interface to extend Express.Request
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
            };
        }
    }
}

export const linkSocialAccount: RequestHandler = async (req: Request, res: Response) => {
    const { platform, accessToken } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return ResUtil.unAuthorized({ res, message: "User not authenticated" });
    }

    const socialAccountRepository = getRepository(SocialAccount);

    try {
        // Validate platform
        if (!['facebook', 'instagram', 'google'].includes(platform)) {
            return ResUtil.badRequest({
                res,
                message: "Invalid platform"
            });
        }

        // Fetch user data using access token
        const socialAuthService = new SocialAuthService();
        let userData;
        if (platform === 'facebook') {
            userData = await socialAuthService.getFacebookUserData(accessToken);
        } else if (platform === 'google') {
            userData = await socialAuthService.getGoogleUserData(accessToken);
        } else {
            return ResUtil.badRequest({
                res,
                message: "Unsupported platform"
            });
        }

        // Ensure userData contains the necessary fields
        if (!userData.id || !userData.name) {
            return ResUtil.internalError({
                res,
                message: "Failed to fetch user data from platform"
            });
        }

        // Check for existing account
        let socialAccount = await socialAccountRepository.findOne({
            where: {
                user: { id: userId },
                platform
            }
        });

        if (socialAccount) {
            // Update existing account
            socialAccount.accessToken = accessToken;
            socialAccount.isActive = true;
            socialAccount.accountName = userData.name;
            socialAccount.accountId = userData.id;
            socialAccount.platformUserId = userData.id; // Ensure platformUserId is set
        } else {
            // Create new account
            socialAccount = socialAccountRepository.create({
                user: { id: userId },
                platform,
                accountName: userData.name,
                accountId: userData.id,
                platformUserId: userData.id, // Ensure platformUserId is set
                accessToken: accessToken,
                isActive: true
            });
        }

        await socialAccountRepository.save(socialAccount);

        return ResUtil.success({
            res,
            message: "Social account linked successfully",
            data: socialAccount
        });
    } catch (error: any) {
        // Add more detailed error logging
        logger.error("Error linking social account", {
            error: error.message,
            stack: error.stack,
            userId,
            platform
        });
        return ResUtil.internalError({
            res,
            message: `Error linking social account: ${error.message}`,
            data: error
        });
    }
};

export const getLinkedAccounts: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        return ResUtil.unAuthorized({ res, message: "User not authenticated" });
    }

    const socialAccountRepository = getRepository(SocialAccount);

    try {
        const accounts = await socialAccountRepository.find({
            where: {
                user: { id: userId },
                isActive: true
            },
            select: ['platform', 'accountId', 'createdAt']
        });

        return ResUtil.success({
            res,
            message: "Linked accounts retrieved successfully",
            data: accounts
        });
    } catch (error: any) {
        logger.error("Error fetching linked accounts", error);
        return ResUtil.internalError({
            res,
            message: "Error fetching linked accounts",
            data: error
        });
    }
};

export const unlinkSocialAccount: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        return ResUtil.unAuthorized({ res, message: "User not authenticated" });
    }

    const { platform } = req.params;
    const socialAccountRepository = getRepository(SocialAccount);

    try {
        const result = await socialAccountRepository.update(
            {
                user: { id: userId },
                platform,
                isActive: true
            },
            {
                isActive: false
            }
        );

        if (result.affected === 0) {
            return ResUtil.notFound({
                res,
                message: "Social account not found"
            });
        }

        return ResUtil.success({
            res,
            message: "Social account unlinked successfully"
        });
    } catch (error: any) {
        logger.error("Error unlinking social account", error);
        return ResUtil.internalError({
            res,
            message: "Error unlinking social account",
            data: error
        });
    }
};

export const getSocialAccountByPlatform: RequestHandler = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { platform } = req.params;

    if (!userId) {
        return ResUtil.unAuthorized({ res, message: "User not authenticated" });
    }

    const socialAccountRepository = getRepository(SocialAccount);

    try {
        const account = await socialAccountRepository.findOne({
            where: {
                user: { id: userId },
                platform,
                isActive: true
            },
            relations: ['user']  // Include user details if needed
        });

        if (!account) {
            return ResUtil.notFound({
                res,
                message: `No linked ${platform} account found`
            });
        }

        return ResUtil.success({
            res,
            message: "Social account retrieved successfully",
            data: account
        });
    } catch (error: any) {
        logger.error("Error fetching social account", error);
        return ResUtil.internalError({
            res,
            message: "Error fetching social account",
            data: error
        });
    }
};