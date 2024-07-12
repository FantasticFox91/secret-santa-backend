import { Module } from '@nestjs/common';
import { ThankYouService } from './thank-you.service';
import { ThankYouController } from './thank-you.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [PrismaModule],
  providers: [ThankYouService, MailService],
  controllers: [ThankYouController],
})
export class ThankYouModule {}
