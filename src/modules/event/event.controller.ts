import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetCurrentUser } from 'src/shared/decorators/get-current-user.decorator';
import { Prefix } from 'src/utils/prefix.enum';

import { JwtPayload } from '../auth/interface/jwt.interface';
import { CreateEventDto } from './dto/create-event.dto';
import { GetEventsDto } from './dto/get-events.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventService } from './event.service';

@Controller(Prefix.EVENTS)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @ApiBearerAuth()
  @Get()
  async getEvents(
    @GetCurrentUser() { sub }: JwtPayload,
    @Query() query: GetEventsDto,
  ) {
    return this.eventService.findAll(sub, query);
  }

  @ApiBearerAuth()
  @Post()
  async createEvent(
    @Body() dto: CreateEventDto,
    @GetCurrentUser() { sub }: JwtPayload,
  ) {
    return this.eventService.create(dto, sub);
  }

  @ApiBearerAuth()
  @Patch(':id')
  async updateEvent(
    @Param('id') eventId: number,
    @Body() dto: UpdateEventDto,
    @GetCurrentUser() { sub }: JwtPayload,
  ) {
    return this.eventService.update(eventId, dto, sub);
  }

  @ApiBearerAuth()
  @Delete(':id')
  async deleteEvent(
    @Param('id') eventId: number,
    @GetCurrentUser() { sub }: JwtPayload,
  ) {
    return this.eventService.delete(eventId, sub);
  }
}
