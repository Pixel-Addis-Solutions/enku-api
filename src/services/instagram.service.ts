import axios from 'axios';
import { getRepository } from '../data-source';
import { SocialAccount } from '../entities/social-account';
import { User } from '../entities/user';
import logger from '../util/logger';
import { TokenData } from '../types/express';

export class InstagramService {
    private socialAccountRepository = getRepository(SocialAccount);
    private userRepository = getRepository(User);

  /**
 * Refresh the Instagram access token.
 */
static async refreshAccessToken(refreshToken: string): Promise<TokenData> {
    try {
        const refreshResponse = await axios.get(`https://graph.instagram.com/refresh_access_token`, {
            params: {
                grant_type: 'ig_refresh_token',
                access_token: refreshToken,
            },
        });

        const newAccessToken = refreshResponse.data.access_token;
        const expiresIn = refreshResponse.data.expires_in;

        logger.info('Refreshed Instagram access token successfully', {
            newAccessToken: newAccessToken,
            expiresIn: expiresIn,
        });

        return {
            access_token: newAccessToken,
            expires_in: expiresIn,
            refresh_token: refreshToken, // Instagram does not provide a new refresh token
        };
    } catch (error: any) {
        logger.error('Error refreshing Instagram access token:', {
            error: error.response?.data || error.message,
            stack: error.stack,
        });

        throw new Error('Failed to refresh Instagram access token');
    }
}

   /**
 * Verify the access token by making a simple API call.
 */
async verifyAccessToken(accessToken: string): Promise<boolean> {
    try {
        const response = await axios.get(`https://graph.instagram.com/me`, {
            params: {
                fields: 'id,username',
                access_token: accessToken,
            },
        });
        logger.info('Access token is valid:', response.data);
        return true;
    } catch (error: any) {
        logger.error('Access token verification failed:', error.response?.data || error.message);
        return false;
    }
}
    /**
     * Check if the access token has the required permissions.
     */
    async checkTokenPermissions(accessToken: string): Promise<any> {
        try {
            const response = await axios.get(`https://graph.facebook.com/debug_token`, {
                params: {
                    input_token: accessToken,
                    access_token: `${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`,
                },
            });
            logger.info('Token permissions:', response.data.data);
            return response.data.data;
        } catch (error: any) {
            logger.error('Error checking token permissions:', error.response?.data || error.message);
            throw new Error('Failed to check token permissions');
        }
    }

    /**
     * Utility function to retry API calls with exponential backoff.
     */
    async withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
        try {
            return await fn();
        } catch (error: any) {
            if (retries > 0 && error.response?.status === 429) { // Rate limit error
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.withRetry(fn, retries - 1, delay * 2);
            }
            throw error;
        }
    }
   /**
 * Create an Instagram post using the access token from the database.
 */


   async createPost(userId: string, caption: string, imageUrl: string, scheduledTime?: Date): Promise<any> {
    try {
        // Fetch the access token
        const socialAccount = await this.getSocialAccount(userId);
        const accessToken = socialAccount.accessToken;

        // Step 1: Upload media to Instagram
        const mediaResponse = await this.withRetry(() =>
            axios.post(`https://graph.facebook.com/v18.0/${userId}/media`, {
                caption,
                image_url: imageUrl,
                access_token: accessToken, // Pass access token in body
            })
        );

        logger.info('Media upload response:', mediaResponse.data);

        if (!mediaResponse.data.id) {
            throw new Error('Instagram media upload failed: No media ID returned');
        }

        // Step 2: Publish the uploaded media
        const publishResponse = await this.withRetry(() =>
            axios.post(`https://graph.facebook.com/v18.0/${userId}/media_publish`, {
                creation_id: mediaResponse.data.id,
                access_token: accessToken, // Pass access token in body
            })
        );

        logger.info('Post publish response:', publishResponse.data);
        return publishResponse.data;
    } catch (error: any) {
        logger.error('Error creating Instagram post:', error.response?.data || error.message);
        throw new Error(`Failed to create Instagram post: ${error.response?.data?.error?.message || error.message}`);
    }
}


/**
 * Fetch the SocialAccount record for the user.
 */
async getSocialAccount(userId: string): Promise<SocialAccount> {
    const socialAccount = await this.socialAccountRepository.findOne({
        where: {
            user: { id: userId },
            platform: 'instagram',
        },
    });

    if (!socialAccount) {
        throw new Error('No Instagram account linked to this user');
    }

    return socialAccount;
}
   
   
   
    /**
     * Fetch Instagram media for the authenticated user.
     */
    async fetchMedia(accessToken: string): Promise<any[]> {
        try {
            // Step 1: Refresh the access token before making the API request
            const newTokenData = await InstagramService.refreshAccessToken(accessToken);
            const newAccessToken = newTokenData.access_token; // Extract the access token

            // Step 2: Fetch media
            const response = await this.withRetry(() =>
                axios.get(`https://graph.instagram.com/me/media`, {
                    params: {
                        fields: 'id,caption,media_type,media_url,permalink,timestamp',
                        access_token: newAccessToken,
                    },
                })
            );

            return response.data.data;
        } catch (error: any) {
            logger.error('Error fetching Instagram media:', error.response?.data || error.message);
            throw new Error('Failed to fetch Instagram media');
        }
    }

    /**
     * Fetch Instagram user profile.
     */
    async getUserProfile(accessToken: string): Promise<any> {
        try {
            // Refresh the access token before making the API request
            // const newAccessToken = await InstagramService.refreshAccessToken(accessToken);

            const response = await this.withRetry(() =>
                axios.get(`https://graph.instagram.com/me`, {
                    params: {
                        fields: 'id,username',
                        access_token: accessToken,
                    },
                })
            );

            return response.data;
        } catch (error: any) {
            logger.error('Error fetching Instagram profile:', error.response?.data || error.message);
            throw new Error('Failed to fetch Instagram profile');
        }
    }

    /**
     * Static method to fetch Instagram user profile.
     */
    static async getUserProfile(accessToken: string): Promise<any> {
        try {
            const profileResponse = await axios.get(`https://graph.instagram.com/me`, {
                params: {
                    fields: 'id,username',
                    access_token: accessToken,
                },
            });

            return profileResponse.data;
        } catch (error: any) {
            console.error('Error fetching Instagram profile:', error.response?.data || error.message);
            throw new Error('Failed to fetch Instagram profile');
        }
    }

    /**
     * Static method to fetch Instagram user media.
     */
    static async getUserMedia(accessToken: string): Promise<any[]> {
        try {
            const mediaResponse = await axios.get(`https://graph.instagram.com/me/media`, {
                params: {
                    fields: 'id,caption,media_type,media_url,permalink,timestamp',
                    access_token: accessToken,
                },
            });

            return mediaResponse.data.data;
        } catch (error: any) {
            console.error('Error fetching Instagram media:', error.response?.data || error.message);
            throw new Error('Failed to fetch Instagram media');
        }
    }

    /**
     * Schedule a post on Instagram.
     */
    static async schedulePost(socialAccountId: string, content: string, scheduledTime: Date): Promise<void> {
        const socialAccountRepo = getRepository(SocialAccount);
        const socialAccount = await socialAccountRepo.findOneOrFail({ 
            where: { id: socialAccountId } 
        });

        if (!socialAccount.platformSettings?.pages?.length) {
            throw new Error('No Facebook pages connected');
        }

        // Post immediately to Facebook with scheduled time
        for (const page of socialAccount.platformSettings.pages) {
            await axios.post(
                `https://graph.facebook.com/${page.id}/feed`,
                {
                    message: content,
                    scheduled_publish_time: Math.floor(scheduledTime.getTime() / 1000),
                    published: false
                },
                {
                    params: {
                        access_token: page.accessToken
                    }
                }
            );
        }
    }
}