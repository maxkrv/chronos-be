import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventCategory, Frequency, UserRole } from '@prisma/client';
import { DatabaseService } from 'src/db/database.service';

import dayjs from '../../utils/dayjs';
import { CreateEventDto } from './dto/create-event.dto';
import { GetEventsDto } from './dto/get-events.dto';
import { UpdateEventDto } from './dto/update-event.dto';

const MINUTE = 1;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

@Injectable()
export class EventService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(userId: number, query: GetEventsDto) {
    const today = new Date();
    const defaultFromDate = new Date(today);
    defaultFromDate.setDate(today.getDate() - 3);
    const defaultToDate = new Date(today);
    defaultToDate.setDate(today.getDate() + 4);

    const from = query.fromDate ? new Date(query.fromDate) : defaultFromDate;
    const to = query.toDate ? new Date(query.toDate) : defaultToDate;

    if (dayjs(to).diff(dayjs(from), 'day') > 31) {
      throw new BadRequestException('Date range must be within one month');
    }

    const userCalendars = await this.databaseService.calendarUser.findMany({
      where: { userId },
      select: { calendarId: true },
    });

    const calendarIds = userCalendars.map((uc) => uc.calendarId);

    if (query.calendarId) {
      if (!calendarIds.includes(query.calendarId)) {
        throw new ForbiddenException('You are not a member of this calendar');
      }
    }

    const allEvents = await this.databaseService.event.findMany({
      where: {
        OR: [
          {
            calendarId: query.calendarId
              ? query.calendarId
              : { in: calendarIds },
          },
          {
            users: {
              some: {
                calendarId: query.calendarId
                  ? query.calendarId
                  : { in: calendarIds },
              },
            },
          },
        ],
        AND: {
          OR: [
            {
              startAt: {
                gte: from,
                lte: to,
              },
              eventRepeat: null,
            },
            {
              endAt: {
                gte: from,
                lte: to,
              },
              eventRepeat: null,
            },
            {
              eventRepeat: {
                isNot: null,
              },
            },
          ],
          ...(query.search
            ? {
                OR: [
                  { name: { contains: query.search, mode: 'insensitive' } },
                  {
                    description: {
                      contains: query.search,
                      mode: 'insensitive',
                    },
                  },
                ],
              }
            : {}),
        },
      },
      include: {
        users: {
          include: {
            user: {
              select: {
                name: true,
                surname: true,
                avatarUrl: true,
              },
            },
          },
        },
        eventRepeat: true,
      },
    });

    return allEvents
      .flatMap((event) => {
        if (!event.eventRepeat) return event;

        const { repeatTime } = event.eventRepeat;
        const start = dayjs(event.startAt);

        if (start.isBetween(from, to, null, '[)')) return event;

        const diff = dayjs(from).diff(start, 'millisecond');
        const lastOccurrence = start.add(
          Math.floor(diff / repeatTime) * repeatTime,
          'millisecond',
        );
        const nextOccurrence = lastOccurrence.add(repeatTime, 'millisecond');

        return lastOccurrence.isBetween(from, to, null, '[)') ||
          nextOccurrence.isBetween(from, to, null, '[)')
          ? event
          : null;
      })
      .filter(Boolean);
  }

  async create(dto: CreateEventDto, userId: number) {
    if (
      dto.startAt &&
      dto.endAt &&
      dayjs(dto.startAt).isAfter(dayjs(dto.endAt))
    ) {
      throw new BadRequestException('startAt must be before endAt');
    }

    const calendar = await this.databaseService.calendar.findUnique({
      where: { id: dto.calendarId },
      include: {
        users: true,
      },
    });

    if (!calendar) {
      throw new NotFoundException('Calendar not found');
    }

    const userInCalendar = calendar.users.find(
      (user) => user.userId === userId,
    );

    if (!userInCalendar) {
      throw new ForbiddenException('You are not a member of this calendar');
    }

    if (
      userInCalendar.role !== UserRole.OWNER &&
      userInCalendar.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException(
        'You do not have permission to create events',
      );
    }

    if (
      (dto.category === EventCategory.REMINDER ||
        dto.category === EventCategory.OCCASION) &&
      dto.endAt !== undefined
    ) {
      throw new BadRequestException(
        'endAt must be undefined for REMINDER and OCCASION categories',
      );
    }

    if (
      dto.category !== EventCategory.REMINDER &&
      dto.category !== EventCategory.OCCASION &&
      (dto.endAt === undefined || dto.startAt === undefined)
    ) {
      throw new BadRequestException(
        'Both startAt and endAt must be defined for ARRANGEMENT and TASK categories',
      );
    }

    if ((dto.frequency && !dto.interval) || (!dto.frequency && dto.interval)) {
      throw new BadRequestException(
        'If frequency is provided, interval must also be provided, and vice versa',
      );
    }

    return this.databaseService.event.create({
      data: {
        name: dto.name,
        description: dto.description,
        color: dto.color,
        startAt: dto.startAt,
        endAt:
          dto.category === EventCategory.REMINDER ||
          dto.category === EventCategory.OCCASION
            ? undefined
            : dto.endAt,
        category: dto.category,
        link: dto.link,
        calendarId: dto.calendarId,
        creatorId: userId,
        eventRepeat:
          dto.frequency && dto.interval
            ? {
                create: {
                  frequency: dto.frequency,
                  interval: dto.interval,
                  repeatTime: this.calculateRepeatTime(
                    dto.frequency,
                    dto.interval,
                  ),
                },
              }
            : undefined,
        users: {
          create: {
            userId: userId,
            calendarId: dto.calendarId,
            role: UserRole.OWNER,
          },
        },
      },
    });
  }

  async update(eventId: number, dto: UpdateEventDto, userId: number) {
    const event = await this.databaseService.event.findUnique({
      where: { id: eventId },
      include: { eventRepeat: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.creatorId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this event',
      );
    }

    if (
      (dto.category === EventCategory.REMINDER ||
        dto.category === EventCategory.OCCASION) &&
      dto.endAt !== undefined
    ) {
      throw new BadRequestException(
        'endAt must be undefined for REMINDER and OCCASION categories',
      );
    }

    if (
      dto.category !== EventCategory.REMINDER &&
      dto.category !== EventCategory.OCCASION &&
      (dto.endAt === undefined || dto.startAt === undefined)
    ) {
      throw new BadRequestException(
        'Both startAt and endAt must be defined for ARRANGEMENT and TASK categories',
      );
    }

    if ((dto.frequency && !dto.interval) || (!dto.frequency && dto.interval)) {
      throw new BadRequestException(
        'If frequency is provided, interval must also be provided, and vice versa',
      );
    }

    const updatedEndAt =
      dto.category === EventCategory.REMINDER ||
      dto.category === EventCategory.OCCASION
        ? null
        : dto.endAt;

    const updatedEvent = await this.databaseService.event.update({
      where: { id: eventId },
      data: {
        name: dto.name,
        description: dto.description,
        color: dto.color,
        startAt: dto.startAt,
        endAt: updatedEndAt,
        category: dto.category,
        link: dto.link,
        calendarId: dto.calendarId,
      },
    });

    if (dto.frequency && dto.interval) {
      if (event.eventRepeat) {
        await this.databaseService.eventRepeat.update({
          where: { eventId: event.id },
          data: {
            frequency: dto.frequency,
            interval: dto.interval,
            repeatTime: this.calculateRepeatTime(dto.frequency, dto.interval),
          },
        });
        return updatedEvent;
      }
      await this.databaseService.eventRepeat.create({
        data: {
          eventId: updatedEvent.id,
          frequency: dto.frequency,
          interval: dto.interval,
          repeatTime: this.calculateRepeatTime(dto.frequency, dto.interval),
        },
      });
      return updatedEvent;
    }

    if (!dto.frequency && !dto.interval && event.eventRepeat) {
      await this.databaseService.eventRepeat.delete({
        where: { eventId: event.id },
      });
    }

    return updatedEvent;
  }

  async delete(eventId: number, userId: number) {
    const event = await this.databaseService.event.findUnique({
      where: { id: eventId },
      select: { creatorId: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.creatorId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to create events',
      );
    }

    return this.databaseService.event.delete({ where: { id: eventId } });
  }

  calculateRepeatTime(frequency: Frequency, interval: number) {
    switch (frequency) {
      case Frequency.MINUTELY:
        return interval * MINUTE;
      case Frequency.HOURLY:
        return interval * HOUR;
      case Frequency.DAILY:
        return interval * DAY;
      case Frequency.WEEKLY:
        return interval * WEEK;
      case Frequency.MONTHLY:
        return interval * MONTH;
      case Frequency.YEARLY:
        return interval * YEAR;
      default:
        throw new Error('Invalid frequency');
    }
  }
}
