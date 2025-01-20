import { Router } from 'express';
import { SocialAuthService } from '../../services/social-auth.service';
import { ResUtil } from '../../helper/response.helper';

const router = Router();

// Route to initiate Facebook login
router.get('/facebook/login', (req, res) => {
    const appId = process.env.FACEBOOK_APP_ID;
    const redirectUri = process.env.FACEBOOK_REDIRECT_URI;
    const scope = 'email,public_profile'; // Add any additional scopes you need

    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;

    res.redirect(authUrl);
});

// Route to handle Facebook callback
router.get('/facebook/callback', async (req, res) => {
    console.log('Received query parameters:', req.query); // Log to debug

    const { code } = req.query;

    if (!code) {
        return ResUtil.badRequest({ res, message: 'Authorization code is missing' });
    }

    console.log('Authorization code received:', code);

    try {
        const socialAuthService = new SocialAuthService();
        const tokenData = await socialAuthService.exchangeAuthCode('facebook', code as string);
        console.log('Token data:', tokenData);

        const userData = await socialAuthService.getFacebookUserData(tokenData.accessToken);
        console.log('User data:', userData);

        return ResUtil.success({
            res,
            message: 'Facebook account linked successfully',
            data: userData,
        });
    } catch (error: any) {
        console.error('Error during Facebook authentication:', error.message);
        return ResUtil.internalError({
            res,
            message: `Error during Facebook authentication: ${error.message}`,
        });
    }
});

export default router;