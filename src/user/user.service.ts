import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

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
}
