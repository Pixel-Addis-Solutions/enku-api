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
import { createInstagramPost, fetchMedia, getUserProfile } from '../../controllers/user/instagram';

const router = Router();
    
router.post("/link", authenticateUser, linkSocialAccount);
router.get("/accounts", authenticateUser, getLinkedAccounts);
router.delete("/accounts/:platform", authenticateUser, unlinkSocialAccount);
router.get("/accounts/:platform", authenticateUser, getSocialAccountByPlatform);

router.post("/facebook/post", authenticateUser,requireLinkedAccount("facebook"), createFacebookPost);
router.get("/facebook/insights", authenticateUser, requireLinkedAccount("facebook"),getFacebookInsights);
router.get("/facebook/pages", authenticateUser, requireLinkedAccount("facebook"),getFacebookPageDetails);

// Additional Instagram functionalities
router.post("/instagram/create-post", authenticateUser,requireLinkedAccount("instagram"),createInstagramPost);
router.post("/instagram/fetch-media", authenticateUser, requireLinkedAccount("instagram"),fetchMedia);
router.post("/instagram/profile", authenticateUser, requireLinkedAccount("instagram"),getUserProfile);

router.post('/schedule', authenticateUser, schedulePost);
router.get('/scheduled', authenticateUser, getScheduledPosts);
router.delete('/schedule/:jobId', authenticateUser, cancelScheduledPost);

export default router; 