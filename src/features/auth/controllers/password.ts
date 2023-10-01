import { joiValidation } from "src/shared/globals/decorators/job-validation.decorators";
import { emailSchema, passwordSchema } from "../schemes/password";
import { Request,Response } from "express";
import { IAuthDocument } from "../interfaces/auth.interface";
import { authService } from "src/shared/service/db/auth.service";
import { BadRequestError } from "src/shared/globals/helpers/error-handler";
import crypto from 'crypto'
import publicIP from 'ip'

import { config } from "src/config";
import { forgotPasswordTemplate } from "src/shared/service/email/templates/forgot-password/forgot-password-template";
import { emailQueue } from "src/shared/service/queue/email.queue";
import HTTP_STATUS from 'http-status-codes'
import moment from "moment";
import { IResetPasswordParams } from "src/features/user/interfaces/user.interface";
import { resetPasswordTemplate } from "src/shared/service/email/templates/reset-password/reset-password-template";
export class Password {
    @joiValidation(emailSchema)
    public async create(req:Request,res:Response):Promise<void>{
        const {email} = req.body
        const existingUser: IAuthDocument = await authService.getAuthUserByEmail(email)
        if(!existingUser){
            throw new BadRequestError('Invalid credentials')
        }
        const ramdomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20))
        const randomCharacters:string = ramdomBytes.toString('hex')
        await authService.updatePasswordToken(`${existingUser._id}`,randomCharacters,Date.now()*60*60*1000)
        const resetLink = `${config.CLIENT_URL}/reset-password?token=${randomCharacters}`
        const template:string = forgotPasswordTemplate.passwordResetTemplate(existingUser.username!,resetLink)
        emailQueue.addEMailJob('forgotPasswordEmail',{template,receiverEmail:email,subject:"Reset your password"})
        res.status(HTTP_STATUS.OK).json({message:"Password reset email sent"})
    }
    @joiValidation(passwordSchema)
    public async update(req:Request,res:Response):Promise<void>{
        const {password,confirmPassword} = req.body
        const {token} = req.params
        if(password!=confirmPassword){
            throw new BadRequestError('Password do not match')
        }
        const existingUser:IAuthDocument = await authService.getAuthUserByPasswordToken(token)
        if(!existingUser){
            throw new BadRequestError('Reset token has expired')
        }
        existingUser.password = password
        existingUser.passwordResetExpires = undefined
        existingUser.passwordResetToken = undefined
        await existingUser.save()
        const templateParams: IResetPasswordParams = {
            username: existingUser.username!,
            email: existingUser.email!,
            ipaddress: publicIP.address(),
            date: moment().format('DD//MM//YYYY HH:mm')
          };
        const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
        emailQueue.addEMailJob('forgotPasswordEmail',{template,receiverEmail:existingUser.email!,subject:"Password Reset Confirm"})
        res.status(HTTP_STATUS.OK).json({message:"Password Success"})
    }
} 