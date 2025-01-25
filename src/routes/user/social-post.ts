import { Router } from "express";
import { authenticateUser } from "../../middlewares/authenticate";
import { requireLinkedAccount } from "../../middlewares/requireLinkedAccount";
import { schedulePost, getScheduledPosts, cancelScheduledPost } from '../../controllers/user/schedule-post';
import {
    linkSocialAccount,
    getLinkedAccounts,
    unlinkSocialAccount,
    getSocialAccountByPlatform
} from "../../controllers/user/social-account";
import { createFacebookPost, getFacebookPageDetails, getFacebookInsights } from '../../controllers/user/facebook';


const router = Router();
    
router.post("/link", authenticateUser, linkSocialAccount);
router.get("/accounts", authenticateUser, getLinkedAccounts);
router.delete("/accounts/:platform", authenticateUser, unlinkSocialAccount);
router.get("/accounts/:platform", authenticateUser, getSocialAccountByPlatform);

router.post("/facebook/post", authenticateUser,requireLinkedAccount("facebook"), createFacebookPost);
router.get("/facebook/insights", authenticateUser, requireLinkedAccount("facebook"),getFacebookInsights);
router.post('/schedule', authenticateUser, schedulePost);
router.get('/scheduled', authenticateUser, getScheduledPosts);
router.delete('/schedule/:jobId', authenticateUser, cancelScheduledPost);

export default router; 