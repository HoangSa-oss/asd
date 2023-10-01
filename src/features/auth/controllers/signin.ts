import { joiValidation } from "src/shared/globals/decorators/job-validation.decorators";
import { loginSchema } from "../schemes/signin";
import { IAuthDocument } from "../interfaces/auth.interface";
import  {authService} from "src/shared/service/db/auth.service";
import { BadRequestError } from "src/shared/globals/helpers/error-handler";
import { IResetPasswordParams, IUserDocument } from "src/features/user/interfaces/user.interface";
import { userService } from "src/shared/service/db/user.service";
import { Request,Response } from "express";
import { config } from "src/config";
import JWT from 'jsonwebtoken';
import HTTP_STATUS from 'http-status-codes';
import { mailTransport } from "src/shared/service/email/email.transport";
import { forgotPasswordTemplate } from "src/shared/service/email/templates/forgot-password/forgot-password-template";
import { emailQueue } from "src/shared/service/queue/email.queue";
import moment from "moment";
import publicIP from 'ip'
import { resetPasswordTemplate } from "src/shared/service/email/templates/reset-password/reset-password-template";

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