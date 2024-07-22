import { PrismaClient, Role, Status } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create some users
  const salt = bcrypt.genSaltSync(10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      hashedPassword: bcrypt.hashSync('12345678', salt),
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      hashedPassword: bcrypt.hashSync('12345678', salt),
      firstName: 'Regular',
      lastName: 'User',
      role: Role.USER,
    },
  });

  const regularUser2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      hashedPassword: bcrypt.hashSync('12345678', salt),
      firstName: 'Regular2',
      lastName: 'User',
      role: Role.USER,
    },
  });

  const regularUser3 = await prisma.user.create({
    data: {
      email: 'user3@example.com',
      hashedPassword: bcrypt.hashSync('12345678', salt),
      firstName: 'Regular3',
      lastName: 'User',
      role: Role.USER,
    },
  });

  const pendingUser = await prisma.user.create({
    data: {
      email: 'user-pending@example.com',
      hashedPassword: bcrypt.hashSync('12345678', salt),
      firstName: 'Pending',
      lastName: 'User',
      role: Role.USER,
    },
  });

  const declinedUser = await prisma.user.create({
    data: {
      email: 'user-declined@example.com',
      hashedPassword: bcrypt.hashSync('12345678', salt),
      firstName: 'Declined',
      lastName: 'User',
      role: Role.USER,
    },
  });

  // Create an event
  const pastEvent = await prisma.event.create({
    data: {
      name: 'Past Party',
      date: new Date(new Date().setDate(new Date().getDate() - 1)),
      updatedAt: new Date(),
      creator: {
        connect: { id: adminUser.id },
      },
      userStatus: {
        create: [
          {
            userId: adminUser.id,
            status: Status.ACCEPTED,
          },
          {
            userId: regularUser.id,
            status: Status.ACCEPTED,
          },
          {
            userId: regularUser2.id,
            status: Status.ACCEPTED,
          },
          {
            userId: regularUser3.id,
            status: Status.ACCEPTED,
          },
          {
            userId: pendingUser.id,
            status: Status.INVITED,
          },
          {
            userId: declinedUser.id,
            status: Status.DECLINED,
          },
        ],
      },
      pairings: {
        create: [
          { santaId: adminUser.id, personId: regularUser.id },
          { santaId: regularUser2.id, personId: regularUser3.id },
          { santaId: pendingUser.id, personId: declinedUser.id },
        ],
      },
      wishList: {
        create: [
          {
            name: 'Book',
            url: 'https://example.com/book',
            userId: adminUser.id,
            siteImage:
              'https://ir.ozone.ru/s3/multimedia-j/wc1000/6654514375.jpg',
            siteTitle: 'Ozon',
            siteDescription: 'Тестовое описания',
          },
          {
            name: 'Gadget',
            url: 'https://example.com/gadget',
            userId: regularUser.id,
            siteImage:
              'https://ir.ozone.ru/s3/multimedia-j/wc1000/6654514375.jpg',
            siteTitle: 'Ozon',
            siteDescription: 'Тестовое описания',
          },
          {
            name: 'Toy',
            url: 'https://example.com/toy',
            userId: regularUser2.id,
            siteImage:
              'https://ir.ozone.ru/s3/multimedia-j/wc1000/6654514375.jpg',
            siteTitle: 'Ozon',
            siteDescription: 'Тестовое описания',
          },
          {
            name: 'Game',
            url: 'https://example.com/game',
            userId: regularUser3.id,
            siteImage:
              'https://ir.ozone.ru/s3/multimedia-j/wc1000/6654514375.jpg',
            siteTitle: 'Ozon',
            siteDescription: 'Тестовое описания',
          },
        ],
      },
    },
  });

  const event = await prisma.event.create({
    data: {
      name: 'Christmas Party',
      date: new Date('2024-12-25T00:00:00.000Z'),
      updatedAt: new Date(),
      creator: {
        connect: { id: adminUser.id },
      },
      userStatus: {
        create: [
          {
            userId: adminUser.id,
            status: Status.ACCEPTED,
          },
          {
            userId: regularUser.id,
            status: Status.ACCEPTED,
          },
          {
            userId: regularUser2.id,
            status: Status.ACCEPTED,
          },
          {
            userId: regularUser3.id,
            status: Status.ACCEPTED,
          },
          {
            userId: pendingUser.id,
            status: Status.INVITED,
          },
          {
            userId: declinedUser.id,
            status: Status.DECLINED,
          },
        ],
      },
      wishList: {
        create: [
          {
            name: 'Book',
            url: 'https://example.com/book',
            userId: adminUser.id,
            siteImage:
              'https://ir.ozone.ru/s3/multimedia-j/wc1000/6654514375.jpg',
            siteTitle: 'Ozon',
            siteDescription: 'Тестовое описания',
          },
          {
            name: 'Gadget',
            url: 'https://example.com/gadget',
            userId: regularUser.id,
            siteImage:
              'https://ir.ozone.ru/s3/multimedia-j/wc1000/6654514375.jpg',
            siteTitle: 'Ozon',
            siteDescription: 'Тестовое описания',
          },
          {
            name: 'Toy',
            url: 'https://example.com/toy',
            userId: regularUser2.id,
            siteImage:
              'https://ir.ozone.ru/s3/multimedia-j/wc1000/6654514375.jpg',
            siteTitle: 'Ozon',
            siteDescription: 'Тестовое описания',
          },
          {
            name: 'Game',
            url: 'https://example.com/game',
            userId: regularUser3.id,
            siteImage:
              'https://ir.ozone.ru/s3/multimedia-j/wc1000/6654514375.jpg',
            siteTitle: 'Ozon',
            siteDescription: 'Тестовое описания',
          },
        ],
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
