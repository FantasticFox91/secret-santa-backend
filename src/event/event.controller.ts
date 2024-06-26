import {
  Controller,
  Headers,
  Post,
  Get,
  Body,
  Patch,
  Param,
  HttpStatus,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { EventService } from './event.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('events')
export class EventController {
  constructor(private readonly eventsService: EventService) {}

  @Post('new')
  async create(
    @Headers('authorization') authHeader: string,
    @Body() body: { groupName: string; date: Date; remind: boolean },
  ) {
    const token = authHeader?.split(' ')[1];
    const { groupName, date, remind } = body;

    try {
      const event = await this.eventsService.createNewGroup(
        token,
        groupName,
        date,
        remind,
      );
      return {
        status: HttpStatus.CREATED,
        message: 'Event created successfully',
        event,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Failed to create event',
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  @Post('accept')
  async acceptInvitation(
    @Body() body: { email: string; password: string; avatar: File },
  ) {
    const { email, password } = body;
    try {
      await this.eventsService.acceptInvitation(email, password);
      return {
        status: HttpStatus.OK,
        message: 'Invitation accepted',
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to accept invitation',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { name: string; date: Date; remind: boolean },
  ) {
    const { name, date, remind } = body;

    try {
      const event = await this.eventsService.updateEvent(
        id,
        name,
        date,
        remind,
      );
      return {
        status: HttpStatus.OK,
        message: 'Event updated successfully',
        event,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Failed to update event',
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }

  @Get()
  async getHello(@Headers('authorization') authHeader: string) {
    const token = authHeader?.split(' ')[1];
    try {
      const event = await this.eventsService.getUserEvent(token);
      return {
        status: HttpStatus.OK,
        message: 'Event found',
        event,
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
    return;
  }

  @Get(':eventId')
  async getEvent(@Param() params: { eventId: string }) {
    try {
      const event = await this.eventsService.getRSVPEvent(params.eventId);
      return {
        event,
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

  @Get('decline/:email')
  async declineInvitation(@Param() params: { email: string }) {
    try {
      await this.eventsService.declineInvitation(params.email);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Failed to decline invitation',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
