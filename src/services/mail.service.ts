import { CONFIG } from '#config';
import { mailTransporter } from '#/providers';
import { UnexpectedError } from '#/errors/classes.errors';
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
      subject: 'Активация аккаунта',
      html: getUserActivationCodeHtml(options),
      text: getUserActivationCodeText(options)
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
      subject: 'Удаление аккаунта',
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
      subject: 'Изменение почты',
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
      subject: 'Сброс пароля',
      html: getPasswordResetCodeHtml(options),
      text: getPasswordResetCodeText(options)
    });
  }
}
