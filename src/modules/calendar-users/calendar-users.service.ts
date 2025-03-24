import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { DatabaseService } from 'src/db/database.service';

import { UpdateCalendarUsersDto } from './dto/update-calendar-users.dto';

@Injectable()
export class CalendarUsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findUsers(calendarId: number, userId: number) {
    const calendar = await this.databaseService.calendar.findUnique({
      where: { id: calendarId },
      include: { users: true },
    });

    if (!calendar) {
      throw new NotFoundException('Calendar not found');
    }

    const isOwner = calendar.ownerId === userId;
    const isMember = calendar.users.some((cu) => cu.userId === userId);

    if (!isOwner && !isMember) {
      throw new ForbiddenException('You are not a member of this calendar');
    }

    return this.databaseService.calendarUser.findMany({
      where: { calendarId },
      include: {
        user: {
          select: {
            name: true,
            surname: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async update(
    calendarId: number,
    userId: number,
    currentUserId: number,
    dto: UpdateCalendarUsersDto,
  ) {
    const calendar = await this.databaseService.calendar.findUnique({
      where: { id: calendarId },
      include: { users: true, owner: true },
    });

    if (!calendar) {
      throw new NotFoundException('Calendar not found');
    }

    if (calendar.ownerId !== currentUserId) {
      throw new ForbiddenException('Only the owner can update user roles');
    }

    if (userId === currentUserId) {
      throw new ForbiddenException('Owner cannot change their own role');
    }

    if (dto.role === UserRole.OWNER) {
      throw new ForbiddenException('Cannot assign OWNER role to another user');
    }

    const calendarUser = await this.databaseService.calendarUser.findFirst({
      where: {
        calendarId,
        userId,
      },
      include: { user: true },
    });

    if (!calendarUser) {
      throw new NotFoundException('User is not a member of this calendar');
    }

    return this.databaseService.calendarUser.update({
      where: { id: calendarUser.id },
      data: { role: dto.role },
      include: { user: true },
    });
  }

  async delete(calendarId: number, userId: number, currentUserId: number) {
    const calendar = await this.databaseService.calendar.findUnique({
      where: { id: calendarId },
      include: { owner: true, users: true },
    });

    if (!calendar) {
      throw new NotFoundException('Calendar not found');
    }

    if (calendar.ownerId !== currentUserId) {
      throw new ForbiddenException('Only the owner can remove users');
    }

    if (userId === currentUserId) {
      throw new ForbiddenException('Owner cannot remove themselves');
    }

    const calendarUser = await this.databaseService.calendarUser.findFirst({
      where: {
        calendarId,
        userId,
      },
    });

    if (!calendarUser) {
      throw new NotFoundException('User is not a member of this calendar');
    }

    return this.databaseService.calendarUser.delete({
      where: { id: calendarUser.id },
    });
  }
}
