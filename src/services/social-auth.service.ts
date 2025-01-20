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
        switch (platform) {
            case 'facebook':
                return this.exchangeFacebookAuthCode(authCode);
            default:
                throw new Error('Unsupported platform');
        }
    }

    private async exchangeFacebookAuthCode(authCode: string): Promise<TokenData> {
        const appId = process.env.FACEBOOK_APP_ID;
        const appSecret = process.env.FACEBOOK_APP_SECRET;
        const redirectUri = process.env.FACEBOOK_REDIRECT_URI;

        try {
            console.log('Exchanging auth code for access token:', {
                appId,
                redirectUri,
                authCode
            });

            const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
                params: {
                    client_id: appId,
                    redirect_uri: redirectUri,
                    client_secret: appSecret,
                    code: authCode
                }
            });

            const { access_token, expires_in } = response.data;

            // Fetch user details with the access token
            const userResponse = await axios.get('https://graph.facebook.com/me', {
                params: {
                    fields: 'id,name,email', // Add email if needed
                    access_token: access_token
                }
            });

            const { id, name } = userResponse.data;

            return {
                accessToken: access_token,
                expiresAt: new Date(Date.now() + expires_in * 1000),
                userId: id,
                accountName: name
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
}
