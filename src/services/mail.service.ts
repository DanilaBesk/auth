import { CONFIG } from '#config';
import { mailTransporter } from '#/providers';
import {
  getActivationCodeHtml,
  getActivationCodeText,
  getChangeEmailHtml,
  getChangeEmailText,
  getResetPasswordCodeHtml,
  getResetPasswordCodeText
} from '#/utils/email';
import { UnexpectedError } from '#/errors/classes.errors';

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
  static async sendActivationCode(toEmail: string, code: string) {
    await this.sendMail({
      from: CONFIG.SMTP_USER,
      to: toEmail,
      subject: 'Активация аккаунта',
      html: getActivationCodeHtml(code),
      text: getActivationCodeText(code)
    });
  }
  static async sendResetPasswordCode(toEmail: string, code: string) {
    await this.sendMail({
      from: CONFIG.SMTP_USER,
      to: toEmail,
      subject: 'Сброс пароля',
      html: getResetPasswordCodeHtml(code),
      text: getResetPasswordCodeText(code)
    });
  }
  static async sendChangeEmailCode(toEmail: string, code: string) {
    await this.sendMail({
      from: CONFIG.SMTP_USER,
      to: toEmail,
      subject: 'Изменение почты',
      html: getChangeEmailHtml(code, toEmail),
      text: getChangeEmailText(code, toEmail)
    });
  }
}
