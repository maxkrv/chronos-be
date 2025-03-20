import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetCurrentUser } from 'src/shared/decorators/get-current-user.decorator';
import { Prefix } from 'src/utils/prefix.enum';

import { JwtPayload } from '../auth/interface/jwt.interface';
import { CreateEventInvitationDto } from './dto/create-event-invitation.dto';
import { EventInvitationsService } from './event-invitations.service';

@Controller(Prefix.EVENT_INVITATIONS)
export class EventInvitationsController {
  constructor(
    private readonly eventInvitationsService: EventInvitationsService,
  ) {}

  @ApiBearerAuth()
  @Get('my')
  async getUserInvitations(@GetCurrentUser() { sub }: JwtPayload) {
    return this.eventInvitationsService.getMyInvitatios(sub);
  }

  @ApiBearerAuth()
  @Get('events/:eventId/invitations')
  async getEventInvitations(
    @Param('eventId') eventId: number,
    @GetCurrentUser() { sub }: JwtPayload,
  ) {
    return this.eventInvitationsService.getInvitations(eventId, sub);
  }

  @ApiBearerAuth()
  @Post()
  async createEventInvitation(
    @Body() dto: CreateEventInvitationDto,
    @GetCurrentUser() { sub }: JwtPayload,
  ) {
    return this.eventInvitationsService.create(dto, sub);
  }

  @ApiBearerAuth()
  @Patch(':invitationId/accept')
  async acceptInvitation(
    @Param('invitationId') invitationId: number,
    @GetCurrentUser() { sub }: JwtPayload,
  ) {
    return this.eventInvitationsService.accept(invitationId, sub);
  }

  @ApiBearerAuth()
  @Patch(':invitationId/decline')
  async declineInvitation(
    @Param('invitationId') invitationId: number,
    @GetCurrentUser() { sub }: JwtPayload,
  ) {
    return this.eventInvitationsService.decline(invitationId, sub);
  }
}
