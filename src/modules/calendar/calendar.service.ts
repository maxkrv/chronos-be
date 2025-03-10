import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Calendar, Prisma, Visibility } from '@prisma/client';
import { DatabaseService } from 'src/db/database.service';
import { Paginated, Paginator } from 'src/shared/pagination';

import { GetPublicCalendarsDto } from './dto/get-public-calendars.dto';

@Injectable()
export class CalendarService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findById(id: number, userId?: number) {
    const calendar = await this.databaseService.calendar.findUnique({
      where: { id },
    });
    if (!calendar) throw new NotFoundException('Calendar not found');

    if (
      calendar.visibility === Visibility.PRIVATE &&
      calendar.ownerId !== userId
    ) {
      throw new ForbiddenException('Calendar is private');
    }

    if (calendar.visibility === Visibility.SHARED) {
      const isUserParticipant = await this.databaseService.calendarUser.count({
        where: { calendarId: id, userId },
      });
      if (!isUserParticipant) {
        throw new ForbiddenException(
          'User is not a participant of this shared calendar',
        );
      }
    }

    return calendar;
  }

  async findByOwnerId(userId: number) {
    return this.databaseService.calendar.findMany({
      where: { ownerId: userId },
    });
  }

  async findPublic(query: GetPublicCalendarsDto): Promise<Paginated<Calendar>> {
    const where: Prisma.CalendarWhereInput = {
      visibility: 'PUBLIC',
      name: query.name
        ? { contains: query.name, mode: 'insensitive' }
        : undefined,
    };
    const data = await this.databaseService.calendar.findMany({
      where,
      orderBy:
        query.sortBy === 'participants'
          ? { users: { _count: query.sortOrder } }
          : { createdAt: query.sortOrder },
      take: query.limit,
      skip: query.limit * (query.page - 1),
    });
    const count = await this.databaseService.calendar.count({
      where,
    });
    const opt = { limit: query.limit, page: query.page };
    return Paginator.paginate(data, count, opt);
  }

  async findParticipating(userId: number) {
    return this.databaseService.calendar.findMany({
      where: {
        users: {
          some: { userId },
        },
      },
    });
  }

  async create(data: Prisma.CalendarCreateInput, ownerId: number) {
    return this.databaseService.calendar.create({
      data: {
        ...data,
        owner: { connect: { id: ownerId } },
      },
    });
  }

  async update(id: number, userId: number, data: Prisma.CalendarUpdateInput) {
    const calendar = await this.databaseService.calendar.findUnique({
      where: { id },
    });
    if (!calendar) throw new NotFoundException('Calendar not found');

    if (calendar.ownerId !== userId) {
      throw new ForbiddenException('Calendar is private');
    }

    return this.databaseService.calendar.update({
      where: { id },
      data,
    });
  }

  async delete(id: number, userId: number) {
    const calendar = await this.databaseService.calendar.findUnique({
      where: { id },
    });
    if (!calendar) throw new NotFoundException('Calendar not found');

    if (calendar.ownerId !== userId) {
      throw new ForbiddenException('Calendar is private');
    }

    return this.databaseService.calendar.delete({
      where: { id },
    });
  }
}
