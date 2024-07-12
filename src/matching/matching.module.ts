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

@Module({
  imports: [PrismaModule],
  providers: [
    MatchingService,
    MailService,
    WishlistService,
    UserService,
    LinkService,
    EventService,
    TaskSchedulerService,
  ],
  controllers: [MatchingController],
})
export class MatchingModule {}
