import { Router } from "express";
import { authenticate } from "../../middlewares/customer-login";
import {
    linkSocialAccount,
    getLinkedAccounts,
    unlinkSocialAccount,
    getSocialAccountByPlatform
} from "../../controllers/user/social-account";
import { createFacebookPost, getFacebookInsights } from '../../controllers/user/facebook';

const router = Router();

router.post("/link", authenticate, linkSocialAccount);
router.get("/accounts", authenticate, getLinkedAccounts);
router.delete("/accounts/:platform", authenticate, unlinkSocialAccount);
router.get("/accounts/:platform", authenticate, getSocialAccountByPlatform);
router.post("/facebook/post", authenticate, createFacebookPost);
router.get("/facebook/insights", authenticate, getFacebookInsights);

export default router; 