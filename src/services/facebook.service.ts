// import FB from 'fb';
import { getRepository } from '../data-source';
import { SocialAccount } from '../entities/social-account';
import logger from '../util/logger';
import 'dotenv/config'; // Ensure environment variables are loaded
import { User } from '../entities/user';

interface FacebookPostOptions {
    message: string;
    link?: string;
    image?: string;
    scheduledTime?: Date;
}

interface FacebookPageDetails {
    id: string;
    name: string;
    picture?: {
        data: {
            url: string;
        };
    };
    link?: string;
    fan_count?: number;
}

interface FacebookUserResponse {
    id: string;
    name: string;
    error?: any;
}

export class FacebookService {
    private fb: any;

    constructor() {
        this.fb = FB;
        this.fb.setAccessToken('');
        this.fb.options({
            appId: process.env.FACEBOOK_APP_ID || '',
            appSecret: process.env.FACEBOOK_APP_SECRET || '',
            version: 'v18.0'
        });
    }

    async createPost(userId: string, options: FacebookPostOptions) {
        try {
            const socialAccountRepo = getRepository(SocialAccount);
            const fbAccount = await socialAccountRepo.findOne({
                where: {
                    user: { id: userId },
                    platform: 'facebook',
                    isActive: true
                }
            });

            if (!fbAccount) {
                throw new Error('No linked Facebook account found');
            }

            this.fb.setAccessToken(fbAccount.accessToken);

            const postData: any = {
                message: options.message,
                scheduled_publish_time: options.scheduledTime ? 
                    Math.floor(options.scheduledTime.getTime() / 1000) : undefined
            };

            if (options.link) {
                postData.link = options.link;
            }

            if (options.image) {
                postData.url = options.image;
            }

            const response = await new Promise((resolve, reject) => {
                this.fb.api(
                    '/me/feed',
                    'post',
                    postData,
                    (response: any) => {
                        if (!response || response.error) {
                            reject(response?.error || new Error('Unknown error'));
                            return;
                        }
                        resolve(response);
                    }
                );
            });

            return response;
        } catch (error) {
            logger.error('Error posting to Facebook:', error);
            throw error;
        }
    }

    async getPageDetails(userId: string) {
        try {
            const socialAccountRepo = getRepository(SocialAccount);
            const fbAccount = await socialAccountRepo.findOne({
                where: {
                    user: { id: userId },
                    platform: 'facebook',
                    isActive: true
                }
            });

            if (!fbAccount) {
                throw new Error('No linked Facebook account found');
            }

            this.fb.setAccessToken(fbAccount.accessToken);

            const pageDetails = await new Promise<FacebookPageDetails>((resolve, reject) => {
                this.fb.api(
                    '/me',
                    'get',
                    { fields: 'id,name,picture,link,fan_count' },
                    (response: FacebookPageDetails | { error: any }) => {
                        if (!response || 'error' in response) {
                            reject(response?.error || new Error('Unknown error'));
                            return;
                        }
                        resolve(response);
                    }
                );
            });

            // Update account details
            await socialAccountRepo.update(fbAccount.id, {
                accountName: pageDetails.name,
                accountId: pageDetails.id
            });

            return pageDetails;
        } catch (error) {
            logger.error('Error getting Facebook page details:', error);
            throw error;
        }
    }

    async getPageInsights(userId: string) {
        try {
            const socialAccountRepo = getRepository(SocialAccount);
            const fbAccount = await socialAccountRepo.findOne({
                where: {
                    user: { id: userId },
                    platform: 'facebook',
                    isActive: true
                }
            });

            if (!fbAccount) {
                throw new Error('No linked Facebook account found');
            }

            this.fb.setAccessToken(fbAccount.accessToken);

            const insights = await new Promise((resolve, reject) => {
                this.fb.api(
                    '/me/insights',
                    'get',
                    {
                        metric: [
                            'page_impressions',
                            'page_engaged_users',
                            'page_posts_impressions'
                        ],
                        period: 'day'
                    },
                    (response: any) => {
                        if (!response || response.error) {
                            reject(response?.error || new Error('Unknown error'));
                            return;
                        }
                        resolve(response);
                    }
                );
            });

            return insights;
        } catch (error) {
            logger.error('Error getting Facebook insights:', error);
            throw error;
        }
    }

    async linkAccount(userId: string, accessToken: string): Promise<boolean> {
        try {
            const userRepository = getRepository(User);
            const user = await userRepository.findOne({ where: { id: userId } });

            if (!user) {
                throw new Error('User not found');
            }

            this.fb.setAccessToken(accessToken);

            // Get user info from Facebook
            const response = await new Promise<FacebookUserResponse>((resolve, reject) => {
                this.fb.api('/me', 'GET', { fields: 'id,name' }, (result: FacebookUserResponse) => {
                    if (result.error) reject(result.error);
                    resolve(result);
                });
            });

            const socialAccountRepo = getRepository(SocialAccount);
            const existingAccount = await socialAccountRepo.findOne({
                where: {
                    user: { id: userId },
                    platform: 'facebook'
                }
            });

            if (existingAccount) {
                await socialAccountRepo.update(existingAccount.id, {
                    accountName: response.name, // Use real name from Facebook
                    accountId: response.id, // Use real ID from Facebook
                    accessToken: accessToken,
                    isActive: true
                });
            } else {
                await socialAccountRepo.save(
                    socialAccountRepo.create({
                        user: user,  // Pass the full user entity
                        platform: 'facebook',
                        accountName: response.name, // Use real name from Facebook
                        accountId: response.id, // Use real ID from Facebook
                        accessToken: accessToken,
                        isActive: true
                    })
                );
            }

            return true;
        } catch (error: any) {
            logger.error('Error linking Facebook account:', {
                userId,
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }
}