import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LinkService } from 'src/link/link.service';
@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    // private link: LinkService,
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

  async addUserWishlist(items: { name: string; url: string }[]) {
    // Пройтись по всем элементам и добавить им данные из link module (Картинка, описание и т.д)
    // items.map(async (item) => {
    //   const response = await this.link.parseHtml(item.url);
    // });
    // Записать все элементы в базу данных с привязкой к конкретному пользователю и конкретному событию.
    // Вернуть true или ошибку
  }
}
