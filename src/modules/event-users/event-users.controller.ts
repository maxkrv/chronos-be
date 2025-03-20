import { Controller, Delete, Get, Param } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetCurrentUser } from 'src/shared/decorators/get-current-user.decorator';
import { Prefix } from 'src/utils/prefix.enum';

import { JwtPayload } from '../auth/interface/jwt.interface';
import { EventUsersService } from './event-users.service';

@Controller(Prefix.EVENT_USER)
export class EventUsersController {
  constructor(private readonly eventUsersService: EventUsersService) {}

  @ApiBearerAuth()
  @Get(':eventId/users')
  async getEventUsers(
    @Param('eventId') eventId: number,
    @GetCurrentUser() { sub }: JwtPayload,
  ) {
    return this.eventUsersService.findUsers(eventId, sub);
  }

  @ApiBearerAuth()
  @Delete(':eventId/users/:userId')
  async removeUserFromEvent(
    @Param('eventId') eventId: number,
    @Param('userId') userId: number,
    @GetCurrentUser() { sub }: JwtPayload,
  ) {
    return this.eventUsersService.delete(eventId, userId, sub);
  }
}
