import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InvitationStatus, UserRole, Visibility } from '@prisma/client';
import { DatabaseService } from 'src/db/database.service';
import CalendarInvitation from 'src/emails/calendar-invitation';
import { MailService } from 'src/shared/services/mail.service';

import { ApiConfigService } from '../../config/api-config.service';
import { CreateCalendarInvitationDto } from './dto/create-calendar-invitation.dto';

@Injectable()
export class CalendarInvitationsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ApiConfigService,
    private readonly mailService: MailService,
  ) {}

  async getMyInvitatios(userId: number) {
    return this.databaseService.calendarInvitation.findMany({
      where: {
        userId,
        status: InvitationStatus.PENDING,
      },
      include: {
        calendar: true,
      },
    });
  }

  async getInvitations(calendarId: number, ownerId: number) {
    const calendar = await this.databaseService.calendar.findUnique({
      where: { id: calendarId },
      select: { ownerId: true },
    });

    if (!calendar) {
      throw new NotFoundException('Calendar not found');
    }

    if (calendar.ownerId !== ownerId) {
      throw new ForbiddenException('You are not the owner of this calendar');
    }

    return this.databaseService.calendarInvitation.findMany({
      where: { calendarId },
      include: {
        user: {
          select: { id: true, name: true, surname: true, avatarUrl: true },
        },
      },
    });
  }

  async create(dto: CreateCalendarInvitationDto, inviterId: number) {
    const calendar = await this.databaseService.calendar.findUnique({
      where: { id: dto.calendarId },
    });
    if (!calendar) {
      throw new NotFoundException('Calendar not found');
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

    if (calendar.ownerId !== inviterId) {
      throw new NotFoundException('Only the calendar owner can invite users');
    }

    const exisitingUserInCalendar =
      await this.databaseService.calendarUser.findFirst({
        where: {
          calendarId: dto.calendarId,
          userId: user.id,
        },
      });
    if (exisitingUserInCalendar) {
      throw new ForbiddenException('User is already a member of this calendar');
    }

    const existingInvitation =
      await this.databaseService.calendarInvitation.findFirst({
        where: {
          calendarId: dto.calendarId,
          userId: user.id,
        },
      });
    if (existingInvitation) {
      await this.databaseService.calendarInvitation.delete({
        where: { id: existingInvitation.id },
      });
    }

    const invitation = await this.databaseService.calendarInvitation.create({
      data: {
        calendarId: dto.calendarId,
        userId: user.id,
        status: InvitationStatus.PENDING,
      },
    });

    await this.mailService.sendMail({
      to: dto.email,
      subject: `Invitation to join "${calendar.name}"`,
      template: await CalendarInvitation({
        inviterName: inviter.name,
        calendarName: calendar.name,
        acceptLink: await this.generateAcceptLink(
          invitation.id,
          dto.calendarId,
        ),
        declineLink: await this.generateDeclineLink(
          invitation.id,
          dto.calendarId,
        ),
      }),
    });

    return invitation;
  }

  async accept(invitationId: number, userId: number) {
    const invitation = await this.databaseService.calendarInvitation.findUnique(
      {
        where: { id: invitationId },
        include: {
          calendar: true,
          user: true,
        },
      },
    );

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.userId !== userId) {
      throw new ForbiddenException('You can only accept your own invitations');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new ForbiddenException('Invitation is already processed');
    }

    await this.databaseService.calendarInvitation.update({
      where: { id: invitationId },
      data: { status: InvitationStatus.ACCEPTED },
    });

    await this.databaseService.calendarUser.create({
      data: {
        userId: userId,
        calendarId: invitation.calendarId,
        role: UserRole.MEMBER,
      },
    });

    if (invitation.calendar.visibility === Visibility.PRIVATE) {
      await this.databaseService.calendar.update({
        where: { id: invitation.calendarId },
        data: { visibility: Visibility.SHARED },
      });
    }

    return {
      calendar: {
        id: invitation.calendar.id,
        name: invitation.calendar.name,
        description: invitation.calendar.description,
        visibility: invitation.calendar.visibility,
        updatedAt: invitation.calendar.updatedAt,
      },
      user: {
        id: invitation.userId,
        name: invitation.user.name,
        email: invitation.user.email,
      },
    };
  }

  async decline(invitationId: number, userId: number) {
    const invitation = await this.databaseService.calendarInvitation.findUnique(
      {
        where: { id: invitationId },
      },
    );

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.userId !== userId) {
      throw new ForbiddenException('You can only decline your own invitations');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new ForbiddenException('Invitation is already processed');
    }

    return this.databaseService.calendarInvitation.update({
      where: { id: invitationId },
      data: { status: InvitationStatus.DECLINED },
    });
  }

  private async generateAcceptLink(
    invitationId: number,
    calendarId: number,
  ): Promise<string> {
    return `${this.configService.getApp().clientUrl}/calendar-invitation/${calendarId}/accept/${invitationId}`;
  }

  private async generateDeclineLink(
    invitationId: number,
    calendarId: number,
  ): Promise<string> {
    return `${this.configService.getApp().clientUrl}/calendar-invitation/${calendarId}/decline/${invitationId}`;
  }
}
