import axios from 'axios';

interface TokenData {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
    userId?: string;
    accountName: string;
}

export class SocialAuthService {
    async exchangeAuthCode(platform: string, authCode: string): Promise<TokenData> {
        let tokenUrl;
        let clientId;
        let clientSecret;
        let redirectUri;

        if (platform === 'facebook') {
            tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token`;
            clientId = process.env.FACEBOOK_APP_ID;
            clientSecret = process.env.FACEBOOK_APP_SECRET;
            redirectUri = process.env.FACEBOOK_REDIRECT_URI;
        } else if (platform === 'google') {
            tokenUrl = `https://oauth2.googleapis.com/token`;
            clientId = process.env.GOOGLE_CLIENT_ID;
            clientSecret = process.env.GOOGLE_CLIENT_SECRET;
            redirectUri = process.env.GOOGLE_REDIRECT_URI;
        } else {
            throw new Error('Unsupported platform');
        }

        try {
            // Log the values being sent in the request
            console.log('Exchanging auth code for access token:', {
                platform,
                tokenUrl,
                clientId,
                clientSecret,
                authCode,
                redirectUri
            });

            const response = await axios.post(tokenUrl, {
                client_id: clientId,
                client_secret: clientSecret,
                code: authCode,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            });

            return {
                accessToken: response.data.access_token,
                refreshToken: response.data.refresh_token,
                expiresAt: new Date(Date.now() + response.data.expires_in * 1000),
                userId: response.data.user_id,  // Adjust based on provider's response
                accountName: response.data.name, // Adjust based on provider's response
            };
        } catch (error: any) {
            console.error('Error exchanging auth code:', error.response?.data || error.message);
            throw new Error('Failed to exchange auth code for access token');
        }
    }

    async getFacebookUserData(accessToken: string) {
        try {
            const userResponse = await axios.get('https://graph.facebook.com/me', {
                params: {
                    fields: 'id,name,email', // Add email if needed
                    access_token: accessToken
                }
            });

            return userResponse.data;
        } catch (error: any) {
            console.error('Error fetching user data from Facebook:', error.response?.data || error.message);
            throw new Error('Failed to fetch user data from Facebook');
        }
    }

    async getGoogleUserData(accessToken: string) {
        try {
            const userResponse = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
                params: {
                    access_token: accessToken
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            return userResponse.data;
        } catch (error: any) {
            console.error('Error fetching user data from Google:', error.response?.data || error.message);
            throw new Error('Failed to fetch user data from Google');
        }
    }
}