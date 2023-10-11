import { loginSchema } from "../schemes/signin";
import { IAuthDocument } from "../interfaces/auth.interface";
import  {authService} from "@service/db/auth.service";
import { userService } from "@service/db/user.service";
import { Request,Response } from "express";
import { config } from "src/config";
import JWT from 'jsonwebtoken';
import HTTP_STATUS from 'http-status-codes';
import { mailTransport } from "@service/emails/email.transport";
import { forgotPasswordTemplate } from "@service/emails/templates/forgot-password/forgot-password-template";
import { emailQueue } from "@service/queues/email.queue";
import moment from "moment";
import publicIP from 'ip'
import { resetPasswordTemplate } from "@service/emails/templates/reset-password/reset-password-template";
import { joiValidation } from '@global/decorators/job-validation.decorators';
import { BadRequestError } from "@global/helpers/error-handler";
import { IUserDocument, IResetPasswordParams } from "@user/interfaces/user.interface";

export class SignIn {
    @joiValidation(loginSchema)
    public async read (req:Request,res:Response):Promise<void>{
      const { username, password } = req.body;
      const existingUser: IAuthDocument = await authService.getAuthUserByUsername(username);
      if (!existingUser) {
        throw new BadRequestError('Invalid credentials');
      }

      const passwordsMatch: boolean = await existingUser.comparePassword(password);
      if (!passwordsMatch) {
        throw new BadRequestError('Invalid credentials');
      }
      const user: IUserDocument = await userService.getUserByAuthId(`${existingUser._id}`);
      const userJwt: string = JWT.sign(
        {
          userId: user._id,
          uId: existingUser.uId,
          email: existingUser.email,
          username: existingUser.username,
          avatarColor: existingUser.avatarColor
        },
        config.JWT_TOKEN!
      ); 
      const templateParams:IResetPasswordParams = {
        username:existingUser.username!,
        email:existingUser.email!,
        ipaddress:publicIP.address(),
        date:moment().format('DD/MM/YYYY HH:mm')

      }
      const resetLink = `${config.CLIENT_URL}/reset-password?token=123213453543645`
      const template:string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams)
      emailQueue.addEMailJob('forgotPasswordEmail',{template,receiverEmail:"duane.bruen@ethereal.email",subject:"Password Config"})
      req.session = { jwt: userJwt };
      res.status(HTTP_STATUS.OK).json({ message: 'User login successfully', user: existingUser, token: userJwt });
    }
}