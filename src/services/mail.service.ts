import { CONFIG } from '#config';
import { mailTransporter } from '#/providers';
import { UnexpectedError } from '#/errors/classes.errors';
import {
  TSendActivationCode,
  TSendChangeEmailCode,
  TSendResetPasswordCode
} from '#/types/mail.types';
import {
  getActivationCodeHtml,
  getActivationCodeText
} from '#/templates/get-activation-code.template';
import {
  getResetPasswordCodeHtml,
  getResetPasswordCodeText
} from '#/templates/get-reset-password-code.template';
import {
  getChangeEmailCodeHtml,
  getChangeEmailCodeText
} from '#/templates/get-change-email-code.template';

export class MailService {
  private static sendMail(options: {
    from: string;
    to: string;
    subject: string;
    html: string;
    text: string;
  }) {
    return new Promise((resolve, reject) => {
      mailTransporter.sendMail(options, (error, info) => {
        if (error) {
          reject(new UnexpectedError(error));
        }
        resolve(info);
      });
    });
  }
  static async sendActivationCode({
    toEmail,
    code,
    requestIp,
    requestIpData,
    requestTime
  }: TSendActivationCode) {
    await this.sendMail({
      from: CONFIG.SMTP_USER,
      to: toEmail,
      subject: 'Активация аккаунта',
      html: getActivationCodeHtml({
        requestIp,
        requestIpData,
        requestTime,
        code
      }),
      text: getActivationCodeText({
        requestIp,
        requestIpData,
        requestTime,
        code
      })
    });
  }
  static async sendResetPasswordCode({
    toEmail,
    code,
    requestIp,
    requestIpData,
    requestTime
  }: TSendResetPasswordCode) {
    await this.sendMail({
      from: CONFIG.SMTP_USER,
      to: toEmail,
      subject: 'Сброс пароля',
      html: getResetPasswordCodeHtml({
        requestIp,
        requestIpData,
        requestTime,
        code
      }),
      text: getResetPasswordCodeText({
        requestIp,
        requestIpData,
        requestTime,
        code
      })
    });
  }
  static async sendChangeEmailCode({
    toEmail,
    code,
    requestIp,
    requestIpData,
    requestTime
  }: TSendChangeEmailCode) {
    await this.sendMail({
      from: CONFIG.SMTP_USER,
      to: toEmail,
      subject: 'Изменение почты',
      html: getChangeEmailCodeHtml({
        requestIp,
        requestIpData,
        requestTime,
        toEmail,
        code
      }),
      text: getChangeEmailCodeText({
        requestIp,
        requestIpData,
        requestTime,
        toEmail,
        code
      })
    });
  }
}
