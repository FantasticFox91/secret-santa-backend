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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
