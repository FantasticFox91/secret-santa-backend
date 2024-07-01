import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import * as hbs from 'nodemailer-express-handlebars';
import * as path from 'path';

@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = createTransport({
      host: 'mailhog',
      port: 1025,
      secure: false,
    });

    const handlebarOptions = {
      viewEngine: {
        partialsDir: path.resolve('./src/mail/templates/'),
        defaultLayout: false,
      },
      viewPath: path.resolve('./src/mail/templates/'),
      extName: '.hbs',
    };

    this.transporter.use('compile', hbs(handlebarOptions));
  }

  async sendEmail(
    to: string,
    subject: string,
    template: string,
    context: any,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: 'no-reply@secret-santa.com',
        to,
        subject,
        template,
        context,
      });
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }
}
