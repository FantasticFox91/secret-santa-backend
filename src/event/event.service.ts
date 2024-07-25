import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { s3StorageService } from '../s3-storage/s3-storage.service';
import { MailService } from 'src/mail/mail.service';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class EventService {
  constructor(
    private prisma: PrismaService,
    private s3Storage: s3StorageService,
    private mailerService: MailService,
  ) {}

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

      await this.prisma.userStatus.create({
        data: {
          userId: userId,
          eventId: event.id,
          status: 'ACCEPTED',
        },
      });

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (remind) {
        const context = {
          name: `${user.firstName} ${user.lastName || ''}`,
          date: this.transformToDDMMYYYY(String(event.date)),
        };

        this.mailerService.scheduleEmail(
          user.email,
          '🎅⏰ The Countdown Claus is Here: Your Secret Santa Event in One Week! 🎁⏰',
          'event-reminder',
          context,
          date,
        );
      }

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
      const currentDate = new Date();

      const events = await this.prisma.event.findMany({
        where: {
          userStatus: {
            some: { userId: userId },
          },
          date: {
            gt: currentDate,
          },
        },
        include: {
          userStatus: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
          pairings: {
            include: {
              person: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              santa: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
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
        include: {
          pairings: {
            include: {
              person: true,
              santa: true,
            },
          },
          userStatus: {
            include: {
              user: true,
            },
          },
        },
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

  async acceptInvitation(email, password, eventId, file) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    try {
      let avatarLink = null;

      if (file) {
        await this.s3Storage.createBucketIfNotExists();
        avatarLink = await this.s3Storage.uploadFile(file);
      }

      const event = await this.prisma.event.findUnique({
        where: { id: eventId },
      });

      const user = await this.prisma.user.update({
        where: { email },
        data: {
          hashedPassword: hash,
          avatar: avatarLink,
        },
      });

      await this.prisma.userStatus.updateMany({
        where: {
          eventId: eventId,
          user: {
            email: email,
          },
        },
        data: {
          status: 'ACCEPTED',
        },
      });

      if (event.sendReminder) {
        const context = {
          name: `${user.firstName} ${user.lastName || ''}`,
          date: this.transformToDDMMYYYY(String(event.date)),
        };

        this.mailerService.scheduleEmail(
          user.email,
          '🎅⏰ The Countdown Claus is Here: Your Secret Santa Event in One Week! 🎁⏰',
          'event-reminder',
          context,
          event.date,
        );
      }
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

  async getPastEvent(eventId) {
    try {
      const [event, pairings, userStatuses] = await Promise.all([
        this.prisma.event.findUnique({
          where: { id: eventId },
          select: {
            id: true,
            name: true,
            date: true,
          },
        }),
        this.prisma.pairings.findMany({
          where: { eventId },
          include: {
            person: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            santa: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        }),
        this.prisma.userStatus.findMany({
          where: { eventId },
          select: {
            id: true,
            status: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        }),
      ]);

      const declinedUsers = [];
      const acceptedUsers = [];
      const failedUsers = [];

      userStatuses.forEach((userStatus) => {
        switch (userStatus.status) {
          case 'DECLINED':
            declinedUsers.push(userStatus);
            break;
          case 'ACCEPTED':
            acceptedUsers.push(userStatus);
            break;
          case 'INVITED':
            failedUsers.push(userStatus);
            break;
        }
      });

      return {
        event,
        pairings,
        acceptedUsers,
        declinedUsers,
        failedUsers,
      };
    } catch (error) {
      console.error('Error fetching event:', error);
      throw new Error('Unable to fetch user event');
    }
  }

  async getPastEvents(token: string) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET,
      ) as jwt.JwtPayload;
      const userId: number = decoded.userId;
      const currentDate = new Date();

      const pastEvents = await this.prisma.event.findMany({
        where: {
          userStatus: {
            some: {
              userId: userId,
              status: 'ACCEPTED',
            },
          },
          date: {
            lt: currentDate,
          },
        },
        select: {
          id: true,
          date: true,
          name: true,
        },
      });

      return pastEvents;
    } catch (error) {
      console.error('Error fetching user events:', error);
      throw new Error('Unable to fetch user events');
    }
  }

  async deleteEvent(eventId) {
    try {
      await this.prisma.event.delete({
        where: { id: eventId },
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      throw new Error('Unable to delete event');
    }
  }

  transformToDDMMYYYY(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();

    return `${day}.${month}.${year}`;
  }
}
