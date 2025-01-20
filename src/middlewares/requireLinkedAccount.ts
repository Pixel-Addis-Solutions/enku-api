import { RequestHandler } from "express";
import { getRepository } from "../data-source";
import { SocialAccount } from "../entities/social-account";

export const requireLinkedAccount = (platform: string): RequestHandler => {
    return async (req, res, next) => {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const socialAccountRepository = getRepository(SocialAccount);
        const account = await socialAccountRepository.findOne({
            where: { user: { id: userId }, platform, isActive: true },
        });

        if (!account) {
            return res.status(400).json({ message: `${platform} account not linked` });
        }

        next();
    };
};
