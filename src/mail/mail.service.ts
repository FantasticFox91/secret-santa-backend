import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import * as hbs from 'nodemailer-express-handlebars';
import * as path from 'path';
import { scheduleJob } from 'node-schedule';

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
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  scheduleEmail(
    to: string,
    subject: string,
    template: string,
    context: any,
    eventDate: Date,
  ): void {
    const reminderDate = new Date(eventDate);
    reminderDate.setDate(reminderDate.getDate() - 7);

    scheduleJob(reminderDate, () => {
      this.sendEmail(to, subject, template, context)
        .then(() => console.log('Email scheduled and sent successfully.'))
        .catch((error) =>
          console.error('Failed to send scheduled email:', error),
        );
    });
  }
}
