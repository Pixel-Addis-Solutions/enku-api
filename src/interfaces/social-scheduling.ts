export enum SocialPlatform {
    FACEBOOK = 'facebook',
    TWITTER = 'twitter',
    INSTAGRAM = 'instagram',
    LINKEDIN = 'linkedin'
}

export interface ScheduledPost {
    id: string;
    platform: SocialPlatform;
    content: string;
    scheduledTime: Date;
    socialAccountId: string;
    mediaUrls?: string[];
    status: 'pending' | 'completed' | 'failed';
} 