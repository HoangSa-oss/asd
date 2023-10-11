import { IEmailJob } from "@user/interfaces/user.interface"
import { emailWorker } from "@worker/email.woker"
import { BaseQueue } from "./base.queue"


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