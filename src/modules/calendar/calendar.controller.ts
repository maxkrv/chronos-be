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
import { CalendarService } from './calendar.service';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';

@Controller(Prefix.CALENDARS)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @ApiBearerAuth()
  @Get('search')
  async getCalendarsByName(@Query('name') name: string) {
    return this.calendarService.getCalendarsByName(name);
  }

  @ApiBearerAuth()
  @Get('public')
  async getPublicCalendars() {
    return this.calendarService.getPublicCalendars();
  }

  @ApiBearerAuth()
  @Get('my')
  async getMyCalendars(@GetCurrentUser() { sub }: JwtPayload) {
    return this.calendarService.getMyCalendars(sub);
  }

  @ApiBearerAuth()
  @Get(':id')
  async getCalendar(
    @Param('id') id: number,
    @GetCurrentUser() { sub }: JwtPayload,
  ) {
    return this.calendarService.getCalendarById(id, sub);
  }

  @ApiBearerAuth()
  @Get()
  async getAllCalendars() {
    return this.calendarService.getAllCalendars();
  }

  @ApiBearerAuth()
  @Post()
  async createCalendar(
    @Body() dto: CreateCalendarDto,
    @GetCurrentUser() { sub }: JwtPayload,
  ) {
    return this.calendarService.createCalendar(dto, sub);
  }

  @ApiBearerAuth()
  @Patch(':id')
  async updateCalendar(
    @Param('id') id: number,
    @Body() dto: UpdateCalendarDto,
    @GetCurrentUser() { sub }: JwtPayload,
  ) {
    return this.calendarService.updateCalendar(id, sub, dto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  async deleteCalendar(
    @Param('id') id: number,
    @GetCurrentUser() { sub }: JwtPayload,
  ) {
    return this.calendarService.deleteCalendar(id, sub);
  }
}
