import { ServerError } from "@global/helpers/error-handler";
import { Helpers } from "@global/helpers/helpers";
import { IUserDocument } from "@user/interfaces/user.interface";
import { BaseCache } from "./base.redis";
import Logger from "bunyan";
import { config } from "@root/config";

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
    public async getUserFromCache(userId:string):Promise<IUserDocument|null>{
        try {
            if(!this.client.isOpen){
                await this.client.connect()
            }
            const response: IUserDocument = (await this.client.HGETALL(`users:${userId}`)) as unknown as IUserDocument;
            response.createdAt = new Date(Helpers.parseJson(`${response.createdAt}`));
            response.postsCount = Helpers.parseJson(`${response.postsCount}`);
            response.blocked = Helpers.parseJson(`${response.blocked}`);
            response.blockedBy = Helpers.parseJson(`${response.blockedBy}`);
            response.notifications = Helpers.parseJson(`${response.notifications}`);
            response.social = Helpers.parseJson(`${response.social}`);
            response.followersCount = Helpers.parseJson(`${response.followersCount}`);
            response.followingCount = Helpers.parseJson(`${response.followingCount}`);
            response.bgImageId = Helpers.parseJson(`${response.bgImageId}`);
            response.bgImageVersion = Helpers.parseJson(`${response.bgImageVersion}`);
            response.profilePicture = Helpers.parseJson(`${response.profilePicture}`);
            response.work = Helpers.parseJson(`${response.work}`);
            response.school = Helpers.parseJson(`${response.school}`);
            response.location = Helpers.parseJson(`${response.location}`);
            response.quote = Helpers.parseJson(`${response.quote}`);
      
            return response;
        } catch (error) {
            log.error(error)
            throw new ServerError('Server error, Try again')
        }

    }
}