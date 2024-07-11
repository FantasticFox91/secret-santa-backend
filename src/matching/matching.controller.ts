import {
  Controller,
  Get,
  Param,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { MatchingService } from './matching.service';

@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get(':eventId')
  async makeUserMatching(@Param('eventId') eventId: string) {
    try {
      await this.matchingService.matchUsers(eventId);
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
