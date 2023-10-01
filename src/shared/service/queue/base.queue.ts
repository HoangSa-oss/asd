import Queue, { Job } from 'bull';
import Logger from 'bunyan';
import { ExpressAdapter, createBullBoard, BullAdapter } from '@bull-board/express';
import { config } from 'src/config';
import { IAuthJob } from 'src/features/auth/interfaces/auth.interface';
import { IEmailJob } from 'src/features/user/interfaces/user.interface';

let BullAdapters:BullAdapter[]=[]
type IBaseJobData = IAuthJob | IEmailJob
export let serverAdapter:ExpressAdapter
export abstract class BaseQueue {
  queue:Queue.Queue
  log:Logger
  constructor(queueName:string){
    this.queue = new Queue(queueName,`${config.REDIS_HOST}`)
    BullAdapters.push(new BullAdapter(this.queue))
    BullAdapters = [...new Set(BullAdapters)]
    serverAdapter = new ExpressAdapter()
    serverAdapter.setBasePath('/queues')
    createBullBoard({
      queues:BullAdapters,
      serverAdapter
    })
    this.log= config.createLogger(`${queueName}Queue`)
    this.queue.on('global:completed',(job:Job)=>{
      job.remove()
    })
    this.queue.on('global:completed',(jobId:string)=>{
      this.log.info(`Job ${jobId} completed`)
    })
    this.queue.on('global:stalled',(jobId:string)=>{
      this.log.info(`Job ${jobId} is stalled`)
    })
  }
  protected addJob(name:string, data:IBaseJobData):void{
    this.queue.add(name,data,{attempts:3,backoff:{type:'fixed',delay:5000}})
  }
  protected processJob(name:string,concurrency:number,callback:Queue.ProcessCallbackFunction<void>):void{
    this.queue.process(name,concurrency,callback)
  }
}

