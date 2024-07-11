import { Module } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { MatchingController } from './matching.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailService } from 'src/mail/mail.service';
import { WishlistService } from 'src/wishlist/wishlist.service';
import { UserService } from 'src/user/user.service';
import { LinkService } from 'src/link/link.service';

@Module({
  imports: [PrismaModule],
  providers: [
    MatchingService,
    MailService,
    WishlistService,
    UserService,
    LinkService,
  ],
  controllers: [MatchingController],
})
export class MatchingModule {}
