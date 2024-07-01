import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [PrismaModule],
  providers: [AuthService, MailService],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
