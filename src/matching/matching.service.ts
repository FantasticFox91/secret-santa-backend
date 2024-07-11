import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { WishlistService } from 'src/wishlist/wishlist.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class MatchingService {
  constructor(
    private prisma: PrismaService,
    private mailerService: MailService,
    private wishlistService: WishlistService,
    private userService: UserService,
  ) {}

  getRandomUsersOrder(
    users: {
      id: number;
      email: string;
      hashedPassword: string | null;
      accessToken: string | null;
      refreshToken: string | null;
      refreshTokenExpire: Date | null;
      firstName: string | null;
      lastName: string | null;
      avatar: string | null;
      createdAt: Date;
      updatedAt: Date;
    }[],
  ) {
    for (let i = users.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [users[i], users[j]] = [users[j], users[i]];
    }
    return users;
  }

  async matchUsers(eventId) {
    try {
      // Fetch all accepted users and their statuses in a single query
      const acceptedUsers = await this.prisma.user.findMany({
        where: {
          status: {
            some: {
              status: {
                equals: 'ACCEPTED',
              },
              eventId: eventId, // Make sure to filter by eventId if relevant
            },
          },
        },
        include: {
          status: true,
        },
      });

      // Shuffle users for random pairing
      const randomUsers = this.getRandomUsersOrder(acceptedUsers);

      // Pre-fetch all user wishlists and deadlines
      const userWishlists = await Promise.all(
        randomUsers.map((user) =>
          this.wishlistService.getUserWishlist(user.id, eventId),
        ),
      );

      const userDeadlines = await Promise.all(
        randomUsers.map((user) =>
          this.userService.getUserWishlist(user.id, eventId),
        ),
      );

      await Promise.all(
        randomUsers.map(async (user, index) => {
          // Calculate the personId for the current user
          const personIndex = (index + 1) % randomUsers.length;
          const person = randomUsers[personIndex];

          // Create the pairing
          await this.prisma.pairings.create({
            data: {
              eventId: eventId,
              santaId: user.id,
              personId: person.id,
            },
          });

          // Construct the email context
          const context = {
            name: `${user.firstName} ${user.lastName || ''}`,
            person: `${person.firstName} ${person.lastName || ''}`,
            wishlistItems: userWishlists[personIndex],
            deadline: userDeadlines[personIndex],
          };

          // Send the email
          await this.mailerService.sendEmail(
            user.email,
            "Ho-Ho-Hold Up! You've Been Secretly Santa'd!",
            'matching',
            context,
          );
        }),
      );

      return true;
    } catch (error) {
      console.error('Error in matchUsers:', error);
      return false;
    }
  }
}
