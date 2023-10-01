import { DoneCallback, Job } from 'bull';
import Logger from 'bunyan';
import { config } from 'src/config';
import { mailTransport } from '../service/email/email.transport';

const log: Logger = config.createLogger('EmailWorker');

class EmailWorker {
  async addNotificationEmail(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { template,receiverEmail,subject} = job.data;
      await mailTransport.sendEmail(receiverEmail,subject,template)
      job.progress(100);
      done(null, job.data);
      console.log('concac')
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

}

export const emailWorker: EmailWorker = new EmailWorker();
