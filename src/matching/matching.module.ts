import { Module } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { MatchingController } from './matching.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailService } from 'src/mail/mail.service';
import { WishlistService } from 'src/wishlist/wishlist.service';
import { UserService } from 'src/user/user.service';
import { LinkService } from 'src/link/link.service';
import { EventService } from 'src/event/event.service';
import { TaskSchedulerService } from 'src/task-scheduler/task-scheduler.service';
import { s3StorageService } from 'src/s3-storage/s3-storage.service';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [PrismaModule, ConfigModule],
  providers: [
    MatchingService,
    MailService,
    WishlistService,
    UserService,
    LinkService,
    EventService,
    TaskSchedulerService,
    s3StorageService,
  ],
  controllers: [MatchingController],
})
export class MatchingModule {}
