import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class ThankYouService {
  constructor(
    private mailerService: MailService,
    private prisma: PrismaService,
  ) {}

  async sendThankYouMessage(token, santaId, eventId, message) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
    const userId: number = decoded.userId;
    try {
      await this.prisma.thankYou.create({
        data: {
          eventId: eventId,
          userId: userId,
          toUserId: Number(santaId),
          message: message,
        },
      });

      const sender = await this.prisma.user.findUnique({
        where: { id: Number(userId) },
      });

      const santa = await this.prisma.user.findUnique({
        where: { id: Number(santaId) },
      });

      const event = await this.prisma.event.findUnique({
        where: { id: eventId },
      });

      const context = {
        senderName: `${sender.firstName} ${sender.lastName}`,
        name: `${santa.firstName} ${santa.lastName}`,
        message: message,
        eventName: event.name,
      };

      await this.mailerService.sendEmail(
        santa.email,
        'You’ve Got Mail! A Thank-You Note Awaits',
        'thank-you-message',
        context,
      );
    } catch (error) {
      console.log(error);
    }
  }
}
