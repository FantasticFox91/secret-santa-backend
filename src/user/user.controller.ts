import {
  Controller,
  UseGuards,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/auth.guard';

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
}
