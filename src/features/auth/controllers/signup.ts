import { ObjectId } from "mongodb";
import { Request,Response } from "express";
import { signupSchema } from "../schemes/signup";
import { joiValidation } from "src/shared/globals/decorators/job-validation.decorators";
import { IAuthDocument, ISignUpData } from "../interfaces/auth.interface";
import { authService } from "src/shared/service/db/auth.service";
import { check } from "prettier";
import { BadRequestError } from "src/shared/globals/helpers/error-handler";
import { Helpers } from "src/shared/globals/helpers/helpers";
import HTTP_STATUS from 'http-status-codes';
import { UserCache } from "src/shared/service/redis/user.cache";
import { IUserDocument } from "src/features/user/interfaces/user.interface";
const userCache:UserCache = new UserCache()
export class SignUp {
    @joiValidation(signupSchema)
    public async create(req:Request,res:Response):Promise<void>{
        const {username,email,password,avatarColor,avatarImage} = req.body
        const checkIfUserExist:IAuthDocument = await authService.getUserByYsernameOrEmail(username,email)
        if(checkIfUserExist){
            throw new BadRequestError('Invalid credentials')
        }
        const authObjectId:ObjectId = new ObjectId()
        const userObjectId:ObjectId = new ObjectId()
        const uId = `${Helpers.generateRandomIntegers(12)}`
        const authData:IAuthDocument = SignUp.prototype.signupData({
            _id:authObjectId,
            uId,
            username,
            email,
            password,
            avatarColor
        })
        const userDataForCache:IUserDocument = SignUp.prototype.userData(authData,userObjectId) 
        await userCache.saveUserToCache(`${userObjectId}`,uId,userDataForCache )
        res.status(HTTP_STATUS.CREATED).json({message:'User createed successfully',authData})
    }
    private signupData(data:ISignUpData):IAuthDocument {
        const {_id,username,email,uId,password,avatarColor} = data
        return {
            _id,
            username:Helpers.firstLetterUppercase(username),
            email:Helpers.lowerCase(email),
            uId,
            password,
            avatarColor,
            createdAt:new Date
        } as IAuthDocument
    }
    private userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
        const { _id, username, email, uId, password, avatarColor } = data;
        return {
          _id: userObjectId,
          authId: _id,
          uId,
          username: Helpers.firstLetterUppercase(username),
          email,
          password,
          avatarColor,
          profilePicture: '',
          blocked: [],
          blockedBy: [],
          work: '',
          location: '',
          school: '',
          quote: '',
          bgImageVersion: '',
          bgImageId: '',
          followersCount: 0,
          followingCount: 0,
          postsCount: 0,
          notifications: {
            messages: true,
            reactions: true,
            comments: true,
            follows: true
          },
          social: {
            facebook: '',
            instagram: '',
            twitter: '',
            youtube: ''
          }
        } as unknown as IUserDocument;
      }
}