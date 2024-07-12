import {
  Controller,
  Post,
  HttpException,
  HttpStatus,
  Param,
  Body,
  Headers,
} from '@nestjs/common';
import { ThankYouService } from './thank-you.service';

@Controller('thank-you')
export class ThankYouController {
  constructor(private readonly thankYouService: ThankYouService) {}

  @Post(':id')
  async SendThankyouMessage(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
    @Body() body: { eventId: string; message: string },
  ) {
    const token = authHeader?.split(' ')[1];
    const { eventId, message } = body;
    try {
      await this.thankYouService.sendThankYouMessage(
        token,
        id,
        eventId,
        message,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to match users',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
