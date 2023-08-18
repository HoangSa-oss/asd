import Queue, { Job } from 'bull';
import Logger from 'bunyan';
import { ExpressAdapter, createBullBoard, BullAdapter } from '@bull-board/express';
import { config } from 'src/config';

let BullAdapters:BullAdapter[]=[]
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
}

