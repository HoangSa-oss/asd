import { IUserDocument } from "src/features/user/interfaces/user.interface";
import { BaseCache } from "./base.redis";
import Logger from "bunyan";
import { config } from "src/config";
import { ServerError } from "src/shared/globals/helpers/error-handler";
const log: Logger = config.createLogger('userCache');

export class UserCache extends BaseCache {
    constructor(){
        super('userCache')
    }
    public async saveUserToCache(key: string, userId: string, createdUser: IUserDocument): Promise<void> {
        const createdAt = new Date();
        const {
          _id,
          uId,
          username,
          email,
          avatarColor,
          blocked,
          blockedBy,
          postsCount,
          profilePicture,
          followersCount,
          followingCount,
          notifications,
          work,
          location,
          school,
          quote,
          bgImageId,
          bgImageVersion,
          social
        } = createdUser;
        const firstList = {
            _id,
            uId,
            username,
            email,
            avatarColor,
            createdAt,
            postsCount,
    
        }
        const secondList = {
            "blocked":JSON.stringify(blocked),
            "blockedBy":JSON.stringify(blockedBy),
            "profilePicture":`${profilePicture}`,
            "followersCount":`${followersCount}`,
            "followingCount":`${followingCount}`,
            'notifications':JSON.stringify(notifications),
            'social':JSON.stringify(social)
        }   
        const thirdList = {
            work,
            location,
            school,
            quote,
            bgImageVersion,
            bgImageId,
            }
        const dataToSave = {...firstList,...secondList,...thirdList}
        try {
            if(!this.client.isOpen){
                await this.client.connect()
            }
            await this.client.ZADD('user',{score:parseInt(userId,10),value:`${key}`})
            for (const [itemKey, itemValue] of Object.entries(dataToSave)) {
                await this.client.HSET(`users:${key}`, `${itemKey}`, `${itemValue}`);
            }
        } catch (error) {
            log.error(error)
            throw new ServerError('Server error. Try again')
        }
    }
}