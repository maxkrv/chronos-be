import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetCurrentUser } from 'src/shared/decorators/get-current-user.decorator';
import { Prefix } from 'src/utils/prefix.enum';

import { JwtPayload } from '../auth/interface/jwt.interface';
import { CalendarUsersService } from './calendar-users.service';
import { UpdateCalendarUsersDto } from './dto/update-calendar-users.dto';

@Controller(Prefix.CALENDAR_USER)
export class CalendarUsersController {
  constructor(private readonly calendarUsersService: CalendarUsersService) {}

  @ApiBearerAuth()
  @Get(':calendarId/users')
  async getCalendarUsers(
    @Param('calendarId') calendarId: number,
    @GetCurrentUser() { sub }: JwtPayload,
  ) {
    return this.calendarUsersService.findUsers(calendarId, sub);
  }

  @ApiBearerAuth()
  @Patch(':calendarId/users/:userId')
  async updateUserRole(
    @Param('calendarId') calendarId: number,
    @Param('userId') userId: number,
    @Body() dto: UpdateCalendarUsersDto,
    @GetCurrentUser() { sub }: JwtPayload,
  ) {
    return this.calendarUsersService.update(calendarId, userId, sub, dto);
  }

  @ApiBearerAuth()
  @Delete(':calendarId/users/:userId')
  async removeUserFromCalendar(
    @Param('calendarId') calendarId: number,
    @Param('userId') userId: number,
    @GetCurrentUser() { sub }: JwtPayload,
  ) {
    return this.calendarUsersService.delete(calendarId, userId, sub);
  }
}
