import schedule from 'node-schedule';
import { SocialPlatform,ScheduledPost} from '../interfaces/social-scheduling';
import { FacebookService } from './facebook.service';
import logger from '../util/logger';

export class SchedulerService {
    private static jobs: Map<string, schedule.Job> = new Map();
    static async schedulePost(
        platform: SocialPlatform,
        socialAccountId: string, 
        content: string, 
        scheduledTime: Date,
        mediaUrls?: string[]
    ) {
        try {
            const jobId = `${platform}-post-${socialAccountId}-${scheduledTime.getTime()}`;
            
            // Cancel existing job if any
            if (this.jobs.has(jobId)) {
                this.jobs.get(jobId)?.cancel();
            }

            // Schedule new job
            const job = schedule.scheduleJob(scheduledTime, async () => {
                try {
                    switch (platform) {
                        case SocialPlatform.FACEBOOK:
                            await FacebookService.schedulePost(socialAccountId, content, scheduledTime);
                            break;
                        case SocialPlatform.TWITTER:
                            // Add Twitter service call
                            break;
                        case SocialPlatform.INSTAGRAM:
                            // Add Instagram service call
                            break;
                        case SocialPlatform.LINKEDIN:
                            // Add LinkedIn service call
                            break;
                    }
                    
                    logger.info(`Successfully executed scheduled post for ${platform} account ${socialAccountId}`);
                    this.jobs.delete(jobId);
                } catch (error) {
                    logger.error(`Failed to execute scheduled post: ${error}`);
                }
            });

            this.jobs.set(jobId, job);
            logger.info(`Scheduled new ${platform} post for ${socialAccountId} at ${scheduledTime}`);
            
            return jobId;
        } catch (error) {
            logger.error(`Error scheduling ${platform} post: ${error}`);
            throw error;
        }
    }

    static cancelScheduledPost(jobId: string) {
        const job = this.jobs.get(jobId);
        if (job) {
            job.cancel();
            this.jobs.delete(jobId);
            logger.info(`Cancelled scheduled post ${jobId}`);
            return true;
        }
        return false;
    }

    static getScheduledPosts(): Partial<ScheduledPost>[] {
        return Array.from(this.jobs.entries()).map(([id, job]) => ({
            id,
            scheduledTime: job.nextInvocation()
        }));
    }
}
