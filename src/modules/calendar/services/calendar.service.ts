import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Calendar,
  EventCategory,
  Prisma,
  UserRole,
  Visibility,
} from '@prisma/client';
import { DatabaseService } from 'src/db/database.service';
import { Paginated, Paginator } from 'src/shared/pagination';

import { GetPublicCalendarsDto } from '../dto/get-public-calendars.dto';
import { NagerDateSDK } from './nager-date-sdk.service';

@Injectable()
export class CalendarService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly nager: NagerDateSDK,
  ) {}

  async addHolidays(countryCode: string, year: number, userId: number) {
    const holidays = await this.nager.getPublicHolidays(year, countryCode);

    const holidayCalendar = await this.databaseService.calendar.upsert({
      where: {
        ownerId_name: { ownerId: userId, name: `${countryCode} Holidays` },
      },
      update: {},
      create: {
        name: `${countryCode} Holidays`,
        visibility: Visibility.PRIVATE,
        ownerId: userId,
        users: {
          create: {
            userId,
            role: UserRole.OWNER,
          },
        },
      },
    });

    const data = holidays.map((holiday) => ({
      name: holiday.name,
      startAt: new Date(holiday.date),
      category: EventCategory.OCCASION,
      calendarId: holidayCalendar.id,
      creatorId: userId,
      color: '#4635b1',
    }));

    await this.databaseService.$transaction(async (tx) => {
      await tx.event.deleteMany({
        where: {
          calendarId: holidayCalendar.id,
          startAt: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31) },
        },
      });

      await tx.event.createMany({
        data,
      });
    });
  }

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

  async findByOwnerId(userId: number, search?: string) {
    return this.databaseService.calendar.findMany({
      where: {
        ownerId: userId,
        AND: search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
      },
      orderBy: { createdAt: 'asc' },
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

  async participateInPublicCalendar(calendarId: number, userId: number) {
    const calendar = await this.databaseService.calendar.findUnique({
      where: { id: calendarId },
    });
    if (!calendar) throw new NotFoundException('Calendar not found');

    if (calendar.visibility !== Visibility.PUBLIC) {
      throw new ForbiddenException('Calendar is not public');
    }

    const isUserParticipant = await this.databaseService.calendarUser.count({
      where: { calendarId, userId },
    });
    if (isUserParticipant) {
      throw new ForbiddenException('User is already a participant');
    }

    return this.databaseService.calendarUser.create({
      data: {
        userId,
        calendarId,
        role: UserRole.MEMBER,
      },
    });
  }

  async findParticipating(userId: number, search?: string) {
    return this.databaseService.calendar.findMany({
      where: {
        users: {
          some: { userId },
        },
        NOT: { ownerId: userId },
        AND: search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
      },
      orderBy: { createdAt: 'asc' },
      include: {
        users: {
          where: { userId },
          select: {
            role: true,
          },
        },
      },
    });
  }

  async create(data: Prisma.CalendarCreateInput, ownerId: number) {
    return this.databaseService.$transaction(async (tx) => {
      const calendar = await tx.calendar.create({
        data: {
          ...data,
          owner: { connect: { id: ownerId } },
        },
      });

      await tx.calendarUser.create({
        data: {
          userId: ownerId,
          calendarId: calendar.id,
          role: UserRole.OWNER,
        },
      });

      return calendar;
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
