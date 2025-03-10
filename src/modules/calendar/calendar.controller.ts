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
import { Calendar } from '@prisma/client';
import { GetCurrentUser } from 'src/shared/decorators/get-current-user.decorator';
import { Paginated } from 'src/shared/pagination';
import { Prefix } from 'src/utils/prefix.enum';

import { JwtPayload } from '../auth/interface/jwt.interface';
import { CalendarService } from './calendar.service';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { GetPublicCalendarsDto } from './dto/get-public-calendars.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';

@Controller(Prefix.CALENDARS)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @ApiBearerAuth()
  @Get('public')
  async getPublicCalendars(
    @Query() query: GetPublicCalendarsDto,
  ): Promise<Paginated<Calendar>> {
    return this.calendarService.findPublic(query);
  }

  @ApiBearerAuth()
  @Get('participating')
  async getParticipatingCalendars(@GetCurrentUser() { sub }: JwtPayload) {
    return this.calendarService.findParticipating(sub);
  }

  @ApiBearerAuth()
  @Get('my')
  async getMyCalendars(@GetCurrentUser() { sub }: JwtPayload) {
    return this.calendarService.findByOwnerId(sub);
  }

  @ApiBearerAuth()
  @Get(':id')
  async getCalendar(
    @Param('id') id: number,
    @GetCurrentUser() { sub }: JwtPayload,
  ) {
    return this.calendarService.findById(id, sub);
  }

  @ApiBearerAuth()
  @Post()
  async createCalendar(
    @Body() dto: CreateCalendarDto,
    @GetCurrentUser() { sub }: JwtPayload,
  ) {
    return this.calendarService.create(dto, sub);
  }

  @ApiBearerAuth()
  @Patch(':id')
  async updateCalendar(
    @Param('id') id: number,
    @Body() dto: UpdateCalendarDto,
    @GetCurrentUser() { sub }: JwtPayload,
  ) {
    return this.calendarService.update(id, sub, dto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  async deleteCalendar(
    @Param('id') id: number,
    @GetCurrentUser() { sub }: JwtPayload,
  ) {
    return this.calendarService.delete(id, sub);
  }
}
