import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { s3StorageService } from 'src/s3-storage/s3-storage.service';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [PrismaModule],
  providers: [EventService, s3StorageService, MailService],
  controllers: [EventController],
  exports: [EventService],
})
export class EventModule {}
