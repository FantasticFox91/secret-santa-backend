import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { LinkModule } from './link/link.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { EventModule } from './event/event.module';
import { MailModule } from './mail/mail.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { MatchingModule } from './matching/matching.module';
import { TaskSchedulerModule } from './task-scheduler/task-scheduler.module';
import { ThankYouModule } from './thank-you/thank-you.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    LinkModule,
    AuthModule,
    EventModule,
    PrismaModule,
    MailModule,
    UserModule,
    WishlistModule,
    MatchingModule,
    TaskSchedulerModule,
    ThankYouModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
