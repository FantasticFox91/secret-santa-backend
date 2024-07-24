import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { s3StorageService } from 'src/s3-storage/s3-storage.service';

@Module({
  imports: [PrismaModule],
  providers: [UserService, s3StorageService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
