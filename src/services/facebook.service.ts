// import FB from 'fb';
import { getRepository } from '../data-source';
import { SocialAccount } from '../entities/social-account';
import logger from '../util/logger';
import 'dotenv/config'; // Ensure environment variables are loaded
import { User } from '../entities/user';
import axios from "axios";

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
    private graphApiVersion = 'v18.0';
    private baseUrl = `https://graph.facebook.com/${this.graphApiVersion}`;

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

            const postData: any = {
                message: options.message,
                access_token: fbAccount.accessToken
            };

            if (options.link) postData.link = options.link;
            if (options.scheduledTime) {
                postData.scheduled_publish_time = Math.floor(options.scheduledTime.getTime() / 1000);
            }

            // Handle image upload if provided
            if (options.image) {
                const imageResponse = await axios.post(
                    `${this.baseUrl}/${fbAccount.accountId}/photos`,
                    {
                        url: options.image,
                        access_token: fbAccount.accessToken
                    }
                );
                postData.attached_media = [{ media_fbid: imageResponse.data.id }];
            }

            const response = await axios.post(
                `${this.baseUrl}/${fbAccount.accountId}/feed`,
                postData
            );

            return response.data;
        } catch (error: any) {
            logger.error('Error posting to Facebook:', error);
            throw error;
        }
    }

    async getPageDetails(userId: string): Promise<FacebookPageDetails> {
        try {
            const socialAccountRepo = getRepository(SocialAccount);
            const fbAccount = await socialAccountRepo.findOne({
                where: { user: { id: userId }, platform: 'facebook', isActive: true },
            });
    
            if (!fbAccount) {
                throw new Error('No linked Facebook account found');
            }
    
            const response = await axios.get(`${this.baseUrl}/${fbAccount.accountId}`, {
                params: { fields: 'id,name,picture,link,fan_count', access_token: fbAccount.accessToken },
            });
    
            const pageDetails = response.data;
    
            // Update account details in DB
            await socialAccountRepo.update(fbAccount.id, {
                accountName: pageDetails.name,
                accountId: pageDetails.id,
            });
    
            return pageDetails;
        } catch (error: any) {
            logger.error('Error fetching Facebook page details:', error.message);
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


            const insights = await new Promise((resolve, reject) => {
                axios.get(
                    `${this.baseUrl}/${fbAccount.accountId}/insights`,
                    {
                        params: {
                            metric: [
                                'page_impressions',
                                'page_engaged_users',
                                'page_posts_impressions'
                            ],
                            period: 'day'
                        }
                    }
                )
                .then((response: any) => {
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
            

            const socialAccountRepo = getRepository(SocialAccount);
            const existingAccount = await socialAccountRepo.findOne({
                where: {
                    user: { id: userId },
                    platform: 'facebook'
                }
            });

            // Get Facebook user details first
            const fbUserResponse = await axios.get('https://graph.facebook.com/me', {
                params: {
                    fields: 'id,name',
                    access_token: accessToken
                }
            });

            const fbUserData = fbUserResponse.data;

            if (existingAccount) {
                await socialAccountRepo.update(existingAccount.id, {
                    accountName: fbUserData.name,
                    accountId: fbUserData.id,
                    accessToken: accessToken,
                    isActive: true
                });
            } else {
                await socialAccountRepo.save(
                    socialAccountRepo.create({
                        user: user,  // Pass the full user entity
                        platform: 'facebook',
                        accountName: fbUserData.name,
                        accountId: fbUserData.id,
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

async function getFacebookUserId(accessToken: string): Promise<string> {
    const url = `https://graph.facebook.com/me?fields=id&access_token=${accessToken}`;
    const response = await axios.get(url);
    return response.data.id; // This is the Facebook user ID
}

export { getFacebookUserId };

export async function getPlatformUserId(
    userId: string,
    platform: string
): Promise<string | null> {
    const socialAccountRepository = getRepository(SocialAccount);
    const account = await socialAccountRepository.findOne({
        where: { user: { id: userId }, platform },
    });
    return account?.platformUserId || null;
}
