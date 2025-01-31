import { getRepository } from '../data-source';
import { SocialAccount } from '../entities/social-account';
import { User } from '../entities/user';
import logger from '../util/logger';
import axios from 'axios';
import 'dotenv/config';
import { TokenData } from '../types/express';

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

export class FacebookService {
  private graphApiVersion = 'v18.0';
  private baseUrl = `https://graph.facebook.com/${this.graphApiVersion}`;


  private async validateAccessToken(accessToken: string): Promise<void> {
    try {
        const response = await axios.get(`${this.baseUrl}/debug_token`, {
            params: {
                input_token: accessToken,
                access_token: `${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`,
            },
        });

        const { is_valid, scopes, expires_at } = response.data.data;

        if (!is_valid) {
            throw new Error('Access token is invalid or expired');
        }

        // Log token details
        logger.info(`Access token is valid and expires at: ${new Date(expires_at * 1000).toISOString()}`);
        logger.info(`Token scopes: ${scopes.join(', ')}`);

        // Check required permissions
        const requiredScopes = ['pages_manage_posts', 'publish_pages'];
        const missingScopes = requiredScopes.filter((scope) => !scopes.includes(scope));

        if (missingScopes.length > 0) {
            throw new Error(`Access token is missing required permissions: ${missingScopes.join(', ')}`);
        }
    } catch (error: any) {
        logger.error('Error validating access token:', error.response?.data || error.message);
        throw error;
    }
}
  /**
   * Create a Facebook post
   */
  async createPost(accessToken: string, options: FacebookPostOptions) {
    try {
      // Validate the access token
      await this.validateAccessToken(accessToken);
  
      // Build the post payload
      const postData: any = {
        message: options.message,
        access_token: accessToken,
      };
  
      if (options.link) postData.link = options.link;
      if (options.scheduledTime) {
        postData.scheduled_publish_time = Math.floor(options.scheduledTime.getTime() / 1000);
        postData.published = false; // Ensure it's marked as scheduled
      }
  
      // Handle image upload
      if (options.image) {
        const imageResponse = await axios.post(
          `${this.baseUrl}/me/photos`,
          {
            url: options.image,
            access_token: accessToken,
            published: false, // Upload image without publishing
          }
        );
        postData.attached_media = [{ media_fbid: imageResponse.data.id }];
      }
  
      // Log the payload
      logger.info(`Posting to Facebook with payload: ${JSON.stringify(postData)}`);
  
      // Post to Facebook
      const response = await axios.post(`${this.baseUrl}/me/feed`, postData);
  
      logger.info('Post created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      // Log detailed error information
      if (error.response) {
        logger.error('Facebook API error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });
      } else {
        logger.error('Unexpected error posting to Facebook:', error.message);
      }
      throw error;
    }
  }
  /**
   * Fetch Facebook page details
   */
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
        params: {
          fields: 'id,name,picture,link,fan_count',
          access_token: fbAccount.accessToken,
        },
      });

      const pageDetails = response.data;

      // Update account details in the database
      await socialAccountRepo.update(fbAccount.id, {
        accountName: pageDetails.name,
        accountId: pageDetails.id,
      });

      return pageDetails;
    } catch (error: any) {
      logger.error('Error fetching Facebook page details:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Fetch Facebook page insights
   */
  async getPageInsights(userId: string) {
    try {
      const socialAccountRepo = getRepository(SocialAccount);
      const fbAccount = await socialAccountRepo.findOne({
        where: {
          user: { id: userId },
          platform: 'facebook',
          isActive: true,
        },
      });

      if (!fbAccount) {
        throw new Error('No linked Facebook account found');
      }

      const response = await axios.get(`${this.baseUrl}/${fbAccount.accountId}/insights`, {
        params: {
          metric: ['page_impressions', 'page_engaged_users', 'page_posts_impressions'],
          period: 'day',
          access_token: fbAccount.accessToken,
        },
      });

      return response.data;
    } catch (error: any) {
      logger.error('Error getting Facebook insights:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Link a Facebook account
   */
  async linkAccount(userId: string, accessToken: string): Promise<boolean> {
    try {
      const userRepository = getRepository(User);
      const socialAccountRepo = getRepository(SocialAccount);

      // 1. Find the user
      const user = await userRepository.findOne({ where: { id: userId } });
      
      // 2. Check for existing Facebook account
      const existingAccount = await socialAccountRepo.findOne({
        where: {
          user: { id: userId },
          platform: 'facebook',
        },
      });

      // 3. Get user's Facebook details
      const fbUserResponse = await axios.get('https://graph.facebook.com/me', {
        params: {
          fields: 'id,name',
          access_token: accessToken,
        },
      });

      const fbUserData = fbUserResponse.data;

      // 4. Update or Create social account
      if (existingAccount) {
        // Update existing link
        await socialAccountRepo.update(existingAccount.id, {
          accountName: fbUserData.name,
          accountId: fbUserData.id,
          accessToken: accessToken,
          isActive: true,
        });
      } else {
        // Create new link
        await socialAccountRepo.save(
          socialAccountRepo.create({
            user, // Pass the full user entity
            platform: 'facebook',
            accountName: fbUserData.name,
            accountId: fbUserData.id,
            accessToken: accessToken,
            isActive: true,
          })
        );
      }

      return true;
    } catch (error: any) {
      logger.error('Error linking Facebook account:', {
        userId,
        error: error.response?.data || error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  static async schedulePost(socialAccountId: string, content: string, scheduledTime: Date) {
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

  static async getPages(accessToken: string) {
    const response = await axios.get('https://graph.facebook.com/me/accounts', {
      params: {
        access_token: accessToken
      }
    });

    return response.data.data.map((page: any) => ({
      id: page.id,
      name: page.name,
      accessToken: page.access_token
    }));
  }

  /**
   * Refresh the Facebook access token
   */
  static async refreshAccessToken(accessToken: string): Promise<TokenData> {
    const socialAccountRepo = getRepository(SocialAccount);
    const account = await socialAccountRepo.findOneOrFail({
        where: { accessToken },
    });

    try {
        // Exchange the current access token for a new long-lived token
        const response = await axios.get('https://graph.facebook.com/oauth/access_token', {
            params: {
                client_id: process.env.FACEBOOK_APP_ID,
                client_secret: process.env.FACEBOOK_APP_SECRET,
                grant_type: 'fb_exchange_token',
                fb_exchange_token: accessToken, // Use the current access token, not the refresh token
            },
        });

        // Update the database with the new token and expiration
        await socialAccountRepo.update(account.id, {
            accessToken: response.data.access_token,
            tokenExpiration: new Date(Date.now() + response.data.expires_in * 1000),
        });

        // Return the new token data
        return {
            access_token: response.data.access_token,
            expires_in: response.data.expires_in,
            refresh_token: account.refreshToken, // Facebook does not return a new refresh token
        };
    } catch (error) {
        logger.error('Error refreshing Facebook access token:', error);
        throw new Error('Failed to refresh Facebook access token');
    }
}
}