import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InvitationStatus, UserRole } from '@prisma/client';
import { DatabaseService } from 'src/db/database.service';
import EventInvitation from 'src/emails/event-invitation';
import { MailService } from 'src/shared/services/mail.service';

import { ApiConfigService } from '../../config/api-config.service';
import { CreateEventInvitationDto } from './dto/create-event-invitation.dto';

@Injectable()
export class EventInvitationsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ApiConfigService,
    private readonly mailService: MailService,
  ) {}

  async getMyInvitatios(userId: number) {
    return this.databaseService.eventInvitation.findMany({
      where: {
        userId,
        status: InvitationStatus.PENDING,
      },
      include: {
        event: true,
      },
    });
  }

  async getInvitations(eventId: number, ownerId: number) {
    const event = await this.databaseService.event.findUnique({
      where: { id: eventId },
      select: { creatorId: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.creatorId !== ownerId) {
      throw new ForbiddenException('You are not the owner of this event');
    }

    return this.databaseService.eventInvitation.findMany({
      where: { eventId },
      include: {
        user: {
          select: { id: true, name: true, surname: true, avatarUrl: true },
        },
      },
    });
  }

  async create(dto: CreateEventInvitationDto, inviterId: number) {
    const event = await this.databaseService.event.findUnique({
      where: { id: dto.eventId },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const user = await this.databaseService.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const inviter = await this.databaseService.user.findUnique({
      where: { id: inviterId },
    });
    if (!inviter) {
      throw new NotFoundException('Inviter not found');
    }

    if (event.creatorId !== inviterId) {
      throw new NotFoundException('Only the event owner can invite users');
    }

    const exisitingUserInEvent = await this.databaseService.eventUser.findFirst(
      {
        where: {
          eventId: dto.eventId,
          userId: user.id,
        },
      },
    );
    if (exisitingUserInEvent) {
      throw new ForbiddenException('User is already a member of this event');
    }

    const existingInvitation =
      await this.databaseService.eventInvitation.findFirst({
        where: {
          eventId: dto.eventId,
          userId: user.id,
        },
      });
    if (existingInvitation) {
      await this.databaseService.eventInvitation.delete({
        where: { id: existingInvitation.id },
      });
    }

    const invitation = await this.databaseService.eventInvitation.create({
      data: {
        eventId: dto.eventId,
        userId: user.id,
        status: InvitationStatus.PENDING,
      },
    });

    await this.mailService.sendMail({
      to: dto.email,
      subject: `Invitation to join "${event.name}"`,
      template: await EventInvitation({
        inviterName: inviter.name,
        eventName: event.name,
        acceptLink: await this.generateAcceptLink(invitation.id, dto.eventId),
        declineLink: await this.generateDeclineLink(invitation.id, dto.eventId),
      }),
    });

    return invitation;
  }

  async accept(invitationId: number, userId: number) {
    const invitation = await this.databaseService.eventInvitation.findUnique({
      where: { id: invitationId },
      include: {
        event: true,
        user: true,
      },
    });

    const myCalendar = await this.databaseService.calendar.findFirst({
      where: { isMain: true, ownerId: userId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.userId !== userId) {
      throw new ForbiddenException('You can only accept your own invitations');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new ForbiddenException('Invitation is already processed');
    }

    await this.databaseService.eventInvitation.update({
      where: { id: invitationId },
      data: { status: InvitationStatus.ACCEPTED },
    });

    await this.databaseService.eventUser.create({
      data: {
        userId: userId,
        calendarId: myCalendar.id,
        eventId: invitation.eventId,
        role: UserRole.MEMBER,
      },
    });

    return {
      event: {
        id: invitation.event.id,
        name: invitation.event.name,
        description: invitation.event.description,
        updatedAt: invitation.event.updatedAt,
      },
      user: {
        id: invitation.userId,
        name: invitation.user.name,
        email: invitation.user.email,
      },
    };
  }

  async decline(invitationId: number, userId: number) {
    const invitation = await this.databaseService.eventInvitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.userId !== userId) {
      throw new ForbiddenException('You can only decline your own invitations');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new ForbiddenException('Invitation is already processed');
    }

    return this.databaseService.eventInvitation.update({
      where: { id: invitationId },
      data: { status: InvitationStatus.DECLINED },
    });
  }

  private async generateAcceptLink(
    invitationId: number,
    eventId: number,
  ): Promise<string> {
    return `${this.configService.getApp().clientUrl}/event-invitation/${eventId}/accept/${invitationId}`;
  }

  private async generateDeclineLink(
    invitationId: number,
    eventId: number,
  ): Promise<string> {
    return `${this.configService.getApp().clientUrl}/event-invitation/${eventId}/decline/${invitationId}`;
  }
}
