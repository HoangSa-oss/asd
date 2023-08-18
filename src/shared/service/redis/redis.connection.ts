import Logger from "bunyan";
import { config } from "src/config";
import { BaseCache } from "./base.redis";

const log:Logger = config.createLogger('redisConnection')

class RedisConnection extends BaseCache {
    constructor(){
        super('redisConnection')
    }
    async connect():Promise<void>{
        try {
            await this.client.connect()
            const res = await this.client.ping()
            console.log(res)
        } catch (error) {
            log.error(error)
        }
    }
}
export const redisConnect:RedisConnection = new RedisConnection()