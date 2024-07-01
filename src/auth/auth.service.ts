import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private mailerService: MailService,
  ) {}

  async createUser(email: string, password: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: email,
          hashedPassword: hash,
          role: 'ADMIN',
        },
      });

      return user;
    } catch (error) {}
  }

  async loginUser(email: string, password: string) {
    // Check user existence
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    // Check user password
    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
    if (!isPasswordValid) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    // Create JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: '30d',
      },
    );

    // Create JWT refresh
    const resetToken = jwt.sign({ email, password }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    // Calculate JWT life duration
    const { exp } = jwt.verify(
      resetToken,
      process.env.JWT_SECRET,
    ) as jwt.JwtPayload;

    // Update user
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        accessToken: token,
        refreshToken: resetToken,
        refreshTokenExpire: new Date(exp * 1000),
      },
    });

    return { accessToken: token };
  }

  async inviteUser(email: string, name: string, eventID: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    const existingEvent = await this.prisma.event.findUnique({
      where: { id: eventID },
    });

    if (!existingEvent) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    let user;
    try {
      user = await this.prisma.user.create({
        data: {
          firstName: name,
          email: email,
          role: 'USER',
          status: {
            create: {
              eventId: eventID,
              status: 'INVITED',
            },
          },
        },
      });
    } catch (error) {
      throw new HttpException(
        'Failed to create user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const inviteLink = `http://localhost:3000/rsvp/${eventID}?email=${encodeURIComponent(email)}`;
    const context = {
      name: `${name}`,
      url: `${inviteLink}`,
    };

    try {
      await this.mailerService.sendEmail(
        email,
        "Jingle all the way! You're invited to a Secret Santa Celebration",
        'test',
        context,
      );
    } catch (error) {
      console.error('Error sending email:', error);
      throw new HttpException(
        'Failed to send invitation email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return user;
  }
}
