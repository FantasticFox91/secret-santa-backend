import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { s3StorageService } from '../s3-storage/s3-storage.service';
@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private s3Storage: s3StorageService,
  ) {}

  async getUserWishlist(userId, eventId) {
    try {
      const wishList = await this.prisma.wishList.findMany({
        where: {
          userId: userId,
          eventId: eventId,
        },
      });

      return wishList;
    } catch (error) {
      console.error('Error fetching user wishlist:', error);
      throw new Error('Unable to fetch user wishlist');
    }
  }

  async getUserById(userId) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: Number(userId) },
      });

      const basicUserInfo = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
      };

      return basicUserInfo;
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw new Error('Unable to fetch user info');
    }
  }

  async updateUserInfo(user, file) {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: user.id },
    });

    let password = '';
    let avatarLink = currentUser.avatar;

    const isPasswordChanged = await bcrypt.compare(
      user.password,
      currentUser.hashedPassword,
    );

    if (user.password && !isPasswordChanged) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(user.password, salt);
      password = hash;
    } else {
      password = currentUser.hashedPassword;
    }

    if (file) {
      await this.s3Storage.createBucketIfNotExists();
      avatarLink = await this.s3Storage.uploadFile(file);
    }

    const userName = user.name.split(' ');

    const firstName = userName[0] || currentUser.firstName;
    const lastName = userName[1] || currentUser.lastName;
    const email = user.email || currentUser.email;

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: firstName,
        lastName: lastName,
        email: email,
        hashedPassword: password,
        avatar: avatarLink,
      },
    });

    return updatedUser;
  }
}
