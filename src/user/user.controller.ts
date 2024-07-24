import {
  Controller,
  UseGuards,
  Post,
  Get,
  Body,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  UseInterceptors,
  UploadedFile,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Post('/wishlist')
  async getUserWishlist(@Body() body: { userId: string; eventId: string }) {
    const { userId, eventId } = body;
    try {
      const wishList = await this.userService.getUserWishlist(userId, eventId);
      return {
        wishList,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to find your event',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Post('/wishlist/add')
  async addWishlist(
    @Body() body: { wishlist: { text: string; url: string }[] },
  ) {
    const { wishlist } = body;
    try {
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to add items to your wishlist',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    try {
      return this.userService.getUserById(id);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to find user',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Patch('/info')
  @UseInterceptors(FileInterceptor('file'))
  async updateUserInfo(@Body() body: { user: string }, @UploadedFile() file) {
    const user = JSON.parse(body.user);
    try {
      return await this.userService.updateUserInfo(user, file);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: `Failed to update user ${error}`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Delete('/delete/:eventId/:userId')
  async deleteInviteUser(
    @Param('eventId') eventId: string,
    @Param('userId') userId: string,
  ) {
    try {
      return this.userService.deleteInvitedUser(Number(userId), eventId);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to find user',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
