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
      id?: number;
      name: string;
      url: string;
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

      const wishList = await this.prisma.wishList.findMany({
        where: {
          userId: userId,
          eventId: eventId,
        },
      });

      const itemsToAdd = items.filter((items) => !items.hasOwnProperty('id'));

      const dbItems = await Promise.all(
        itemsToAdd.map(async (item) => {
          const response = await this.link.parseHtml(item.url);
          return {
            name: item.name,
            url: item.url,
            userId: userId,
            eventId: eventId,
            siteImage: response.image,
            siteTitle: response.title,
            siteDescription: response.description,
          };
        }),
      );

      const itemsToDelete = wishList
        .filter((el) => el.hasOwnProperty('id'))
        .filter((el) => !items.some((item) => item.id === el.id));

      // Save items to the database
      const createdItems = await this.prisma.wishList.createMany({
        data: dbItems,
      });

      // Delete items from database
      if (itemsToDelete.length) {
        const deletedItems = await this.prisma.wishList.deleteMany({
          where: {
            id: {
              in: itemsToDelete.map((item) => item.id),
            },
          },
        });
      }
    } catch (error) {
      console.error('Error adding items to event wishlist:', error);
      throw new Error('Unable to fetch user wishlist');
    }
  }
}
