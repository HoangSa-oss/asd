import { IEmailJob } from "src/features/user/interfaces/user.interface";
import { BaseQueue } from "./base.queue";
import { emailWorker } from "src/shared/workers/email.woker";

class EmailQueue extends BaseQueue {
    constructor(){
        super('emails')
        this.processJob('forgotPasswordEmail',5,emailWorker.addNotificationEmail)
    }
    public addEMailJob(name:string,data:IEmailJob):void{
        this.addJob(name,data)
    }
}
export const emailQueue:EmailQueue= new EmailQueue()