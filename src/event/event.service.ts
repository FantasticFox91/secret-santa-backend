import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  async createNewGroup(
    token: string,
    name: string,
    date: Date,
    remind: boolean,
  ) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET,
      ) as jwt.JwtPayload;
      const userId = decoded.userId;

      const event = await this.prisma.event.create({
        data: {
          date: date,
          sendReminder: remind,
          updatedAt: new Date(),
          name: name,
          creator: {
            connect: { id: userId },
          },
        },
      });

      return event;
    } catch (error) {
      console.error('Error creating new group:', error);
      throw new Error('Unable to create event');
    }
  }

  async getUserEvent(token: string) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET,
      ) as jwt.JwtPayload;
      const userId: number = decoded.userId;

      const events = await this.prisma.event.findMany({
        where: { creatorId: userId },
      });

      return events;
    } catch (error) {
      console.error('Error fetching user events:', error);
      throw new Error('Unable to fetch user events');
    }
  }

  async getRSVPEvent(eventId) {
    try {
      const event = await this.prisma.event.findUnique({
        where: { id: eventId },
      });

      return event;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw new Error('Unable to fetch user event');
    }
  }

  async declineInvitation(email) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }

      await this.prisma.userStatus.updateMany({
        where: {
          user: {
            email: email,
          },
        },
        data: {
          status: 'DECLINED',
        },
      });
    } catch (error) {
      console.error('Error declining invitation:', error);
      throw new Error('Unable to decline invitation');
    }
  }

  async acceptInvitation(email, password) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    console.log(email, password);
    try {
      await this.prisma.user.update({
        where: { email },
        data: {
          hashedPassword: hash,
        },
      });

      await this.prisma.userStatus.updateMany({
        where: {
          user: {
            email: email,
          },
        },
        data: {
          status: 'ACCEPTED',
        },
      });
    } catch (error) {}
  }

  async updateEvent(id: string, name: string, date: Date, remind: boolean) {
    try {
      const event = await this.prisma.event.update({
        where: { id: id },
        data: {
          name: name,
          date: date,
          sendReminder: remind,
          updatedAt: new Date(),
        },
      });

      return event;
    } catch (error) {
      console.error('Error updating event:', error);
      throw new Error('Unable to update event');
    }
  }
}
