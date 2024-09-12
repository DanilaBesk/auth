import { CONFIG } from '#config';
import { createTransport } from 'nodemailer';
export const mailTransporter = createTransport({
  host: CONFIG.SMTP_HOST,
  port: CONFIG.SMTP_PORT,
  secure: false,
  auth: {
    user: CONFIG.SMTP_USER,
    pass: CONFIG.SMTP_PASSWORD
  }
});
