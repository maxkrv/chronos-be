import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetCurrentUser } from 'src/shared/decorators/get-current-user.decorator';
import { Prefix } from 'src/utils/prefix.enum';

import { JwtPayload } from '../auth/interface/jwt.interface';
import { CalendarInvitationsService } from './calendar-invitations.service';
import { CreateCalendarInvitationDto } from './dto/create-calendar-invitation.dto';

@Controller(Prefix.CALENDAR_INVITATIONS)
export class CalendarInvitationsController {
  constructor(
    private readonly calendarInvitationsService: CalendarInvitationsService,
  ) {}

  @ApiBearerAuth()
  @Get('my')
  async getUserInvitations(@GetCurrentUser() { sub }: JwtPayload) {
    return this.calendarInvitationsService.getMyInvitatios(sub);
  }

  @ApiBearerAuth()
  @Get('calendar/:calendarId/invitations')
  async getCalendarInvitations(
    @Param('calendarId') calendarId: number,
    @GetCurrentUser() { sub }: JwtPayload,
  ) {
    return this.calendarInvitationsService.getInvitations(calendarId, sub);
  }

  @ApiBearerAuth()
  @Post()
  async createCalendarInvitation(
    @Body() dto: CreateCalendarInvitationDto,
    @GetCurrentUser() { sub }: JwtPayload,
  ) {
    return this.calendarInvitationsService.create(dto, sub);
  }

  @ApiBearerAuth()
  @Patch(':invitationId/accept')
  async acceptInvitation(
    @Param('invitationId') invitationId: number,
    @GetCurrentUser() { sub }: JwtPayload,
  ) {
    return this.calendarInvitationsService.accept(invitationId, sub);
  }

  @ApiBearerAuth()
  @Patch(':invitationId/decline')
  async declineInvitation(
    @Param('invitationId') invitationId: number,
    @GetCurrentUser() { sub }: JwtPayload,
  ) {
    return this.calendarInvitationsService.decline(invitationId, sub);
  }
}
