import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as jwt from 'jsonwebtoken';
import { LinkService } from 'src/link/link.service';

@Injectable()
export class WishlistService {
  constructor(
    private prisma: PrismaService,
    private link: LinkService,
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

  async addUserWishlist(
    items: {
      text: string;
      link: string;
      title?: string;
      description?: string;
      image?: string;
      site?: string;
    }[],
    eventId: string,
    token: string,
  ) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET,
      ) as jwt.JwtPayload;

      const userId = decoded.userId;
      const dbItems = await Promise.all(
        items.map(async (item) => {
          const response = await this.link.parseHtml(item.link);
          return {
            name: item.text,
            url: item.link,
            userId: userId,
            eventId: eventId,
            siteImage: response.image,
            siteTitle: response.title,
            siteDescription: response.description,
          };
        }),
      );

      // Save items to the database
      const createdItems = await this.prisma.wishList.createMany({
        data: dbItems,
      });
    } catch (error) {
      console.error('Error adding items to event wishlist:', error);
      throw new Error('Unable to fetch user wishlist');
    }
  }
}
