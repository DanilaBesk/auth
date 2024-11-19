import { CONFIG } from '#config';
import { mailTransporter } from '#/providers';
import { UnexpectedError } from '#/errors/common-classes.errors';
import { TSend, TSendActionCode } from '#/types/mail.types';
import {
  getEmailChangeCodeHtml,
  getEmailChangeCodeText
} from '#/templates/get-email-change-code.template';
import {
  getPasswordResetCodeHtml,
  getPasswordResetCodeText
} from '#/templates/get-password-reset-code.template';
import {
  getUserActivationCodeHtml,
  getUserActivationCodeText
} from '#/templates/get-user-activation-code.template';
import {
  getUserDeletionCodeHtml,
  getUserDeletionCodeText
} from '#/templates/get-user-deletion-code.template';
import {
  getSignInCodeHtml,
  getSignInCodeText
} from '#/templates/get-sign-in-code.template';

export class MailService {
  private static sendMail({
    email,
    subject,
    html,
    text
  }: TSend): ReturnType<typeof mailTransporter.sendMail> {
    return new Promise((resolve, reject) => {
      mailTransporter.sendMail(
        {
          from: CONFIG.SMTP_USER,
          to: email,
          subject,
          html,
          text
        },
        (error, info) => {
          if (error) {
            reject(new UnexpectedError(error));
          }
          resolve(info);
        }
      );
    });
  }

  static async sendUserActivationCode({
    email,
    code,
    requestIp,
    requestIpData,
    requestTime
  }: TSendActionCode) {
    const options = {
      code,
      requestIp,
      requestIpData,
      requestTime
    };

    return await this.sendMail({
      email,
      subject: `${code} - код активации аккаунта`,
      html: getUserActivationCodeHtml(options),
      text: getUserActivationCodeText(options)
    });
  }

  static async sendSignInCode({
    email,
    code,
    requestIp,
    requestIpData,
    requestTime
  }: TSendActionCode) {
    const options = {
      code,
      requestIp,
      requestIpData,
      requestTime
    };
    return await this.sendMail({
      email,
      subject: `${code} - код для входа в аккаунт`,
      html: getSignInCodeHtml(options),
      text: getSignInCodeText(options)
    });
  }

  static async sendUserDeletionCode({
    email,
    code,
    requestIp,
    requestIpData,
    requestTime
  }: TSendActionCode) {
    const options = {
      code,
      requestIp,
      requestIpData,
      requestTime
    };
    return await this.sendMail({
      email,
      subject: `${code} - код удаления аккаунта`,
      html: getUserDeletionCodeHtml(options),
      text: getUserDeletionCodeText(options)
    });
  }

  static async sendEmailChangeCode({
    email,
    code,
    requestIp,
    requestIpData,
    requestTime
  }: TSendActionCode) {
    const options = {
      email,
      code,
      requestIp,
      requestIpData,
      requestTime
    };
    return await this.sendMail({
      email,
      subject: `${code} - код смены почты`,
      html: getEmailChangeCodeHtml(options),
      text: getEmailChangeCodeText(options)
    });
  }

  static async sendPasswordResetCode({
    email,
    code,
    requestIp,
    requestIpData,
    requestTime
  }: TSendActionCode) {
    const options = {
      code,
      requestIp,
      requestIpData,
      requestTime
    };
    return await this.sendMail({
      email,
      subject: `${code} - код сброса пароля`,
      html: getPasswordResetCodeHtml(options),
      text: getPasswordResetCodeText(options)
    });
  }
}
