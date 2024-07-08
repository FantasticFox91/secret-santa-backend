import {
  Controller,
  UseGuards,
  HttpStatus,
  HttpException,
  Body,
  Post,
  Headers,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @UseGuards(AuthGuard)
  @Post('user')
  async getUserWishlist(@Body() body: { userId: string; eventId: string }) {
    const { userId, eventId } = body;
    try {
      const wishList = await this.wishlistService.getUserWishlist(
        userId,
        eventId,
      );
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
  @Post('add')
  async addUserWishlist(
    @Headers('authorization') authHeader: string,
    @Body() body: { items: { text: string; link: string }[]; eventId: string },
  ) {
    const { items, eventId } = body;
    const token = authHeader?.split(' ')[1];
    try {
      const response = await this.wishlistService.addUserWishlist(
        items,
        eventId,
        token,
      );
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
}
