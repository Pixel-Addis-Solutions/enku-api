import axios from 'axios';
import { getRepository } from '../data-source';
import { SocialAccount } from '../entities/social-account';
import { User } from '../entities/user';
import logger from '../util/logger';

export class InstagramService {
    private socialAccountRepository = getRepository(SocialAccount);
    private userRepository = getRepository(User);

    /**
     * Refresh the Instagram access token.
     */
    async refreshAccessToken(accessToken: string) {
        try {
            const refreshResponse = await axios.get(`https://graph.instagram.com/refresh_access_token`, {
                params: {
                    grant_type: 'ig_refresh_token',
                    access_token: accessToken,
                },
            });

            const newAccessToken = refreshResponse.data.access_token;
            logger.info('Refreshed Instagram access token successfully');
            return newAccessToken;
        } catch (error: any) {
            logger.error('Error refreshing Instagram access token:', error.response?.data || error.message);
            throw new Error('Failed to refresh Instagram access token');
        }
    }

    /**
     * Verify the access token by making a simple API call.
     */
    async verifyAccessToken(accessToken: string) {
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
    async checkTokenPermissions(accessToken: string) {
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
     * Link an Instagram account to a user.
     */
    async linkAccount(userId: number, socialData: any) {
        try {
            const existingAccount = await this.socialAccountRepository.findOne({
                where: {
                    platformUserId: socialData.platformUserId,
                    platform: 'instagram',
                },
            });

            if (existingAccount) {
                throw new Error('This Instagram account is already linked to another user');
            }

            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new Error('User not found');
            }

            const socialAccount = this.socialAccountRepository.create({
                user,
                platform: 'instagram',
                platformUserId: socialData.platformUserId,
                accountName: socialData.accountName,
                accessToken: socialData.accessToken,
                refreshToken: socialData.refreshToken,
            });

            await this.socialAccountRepository.save(socialAccount);
            return socialAccount;
        } catch (error) {
            logger.error('Error linking Instagram account:', error);
            throw error;
        }
    }

    /**
     * Create a new user from Instagram data.
     */
    async createUserFromInstagram(socialData: any) {
        try {
            const existingAccount = await this.socialAccountRepository.findOne({
                where: {
                    platformUserId: socialData.platformUserId,
                    platform: 'instagram',
                },
            });

            if (existingAccount) {
                return existingAccount;
            }

            // Create a new user
            const user = this.userRepository.create({
                username: socialData.accountName,
                email: socialData.emails?.[0]?.value,
            });

            await this.userRepository.save(user);

            // Create a new social account
            const socialAccount = this.socialAccountRepository.create({
                user,
                platform: 'instagram',
                platformUserId: socialData.platformUserId,
                accountName: socialData.accountName,
                accessToken: socialData.accessToken,
                refreshToken: socialData.refreshToken,
            });

            await this.socialAccountRepository.save(socialAccount);
            return socialAccount;
        } catch (error) {
            logger.error('Error creating user from Instagram:', error);
            throw error;
        }
    }

    /**
     * Create an Instagram post using the access token.
     */
    async createPost(accessToken: string, caption: string, imageUrl: string, scheduledTime?: Date) {
        try {
            // Refresh the access token before making the API request
            const newAccessToken = await this.refreshAccessToken(accessToken);
    
            // Verify the new access token
            const isTokenValid = await this.verifyAccessToken(newAccessToken);
            if (!isTokenValid) {
                throw new Error('Invalid access token');
            }
    
            // Step 1: Upload the image to Instagram and create a media container
            const containerResponse = await this.withRetry(() =>
                axios.post(`https://graph.facebook.com/v18.0/me/media`, {
                    image_url: imageUrl,
                    caption,
                    access_token: newAccessToken,
                    ...(scheduledTime && { scheduled_publish_time: Math.floor(scheduledTime.getTime() / 1000) }), // Convert to Unix timestamp
                })
            );
    
            logger.info('Media container response:', containerResponse.data);
    
            const containerId = containerResponse.data.id;
    
            if (!containerId) {
                throw new Error('Failed to create media container: No container ID returned');
            }
    
            // Step 2: Publish the container (if not scheduled)
            if (!scheduledTime) {
                const publishResponse = await this.withRetry(() =>
                    axios.post(`https://graph.facebook.com/v18.0/me/media_publish`, {
                        creation_id: containerId,
                        access_token: newAccessToken,
                    })
                );
    
                logger.info('Publish response:', publishResponse.data);
                return publishResponse.data;
            } else {
                // For scheduled posts, return the container ID
                return {
                    containerId,
                    message: 'Post scheduled successfully',
                    scheduledTime: scheduledTime.toISOString(),
                };
            }
        } catch (error: any) {
            logger.error('Error creating Instagram post:', {
                error: error.response?.data || error.message,
                request: error.config?.data ? JSON.parse(error.config.data) : null,
                stack: error.stack,
            });
            throw new Error(`Failed to create Instagram post: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    /**
     * Fetch Instagram media for the authenticated user.
     */
    async fetchMedia(accessToken: string) {
        try {
            // Refresh the access token before making the API request
            const newAccessToken = await this.refreshAccessToken(accessToken);

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
    async getUserProfile(accessToken: string) {
        try {
            // Refresh the access token before making the API request
            const newAccessToken = await this.refreshAccessToken(accessToken);

            const response = await this.withRetry(() =>
                axios.get(`https://graph.instagram.com/me`, {
                    params: {
                        fields: 'id,username',
                        access_token: newAccessToken,
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
    static async getUserProfile(accessToken: string) {
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
    static async getUserMedia(accessToken: string) {
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
}