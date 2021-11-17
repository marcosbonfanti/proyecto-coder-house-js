import Config from '../config';
import nodemailer from 'nodemailer';
import path from 'path';
import { Logger } from './logger';

class Email {
  private owner: any;
  private transporter;

  constructor() {
    this.owner = {
      name: Config.ADMIN_NAME,
      address: Config.ADMIN_EMAIL,
    };

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: Config.ADMIN_EMAIL,
        pass: Config.ADMIN_EMAIL_PASSWORD,
      },
    });

    this.transporter.verify().then(() => Logger.info('Email service, ready'));
  }

  async sendEmail(dest: string, subject: string, content: string) {
    const mailOptions = {
      from: this.owner,
      to: dest,
      subject,
      html: content,
    };

    const response = await this.transporter.sendMail(mailOptions);
    return response;
  }
}

export const EmailService = new Email();
