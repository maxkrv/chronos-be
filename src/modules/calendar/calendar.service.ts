import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Visibility } from '@prisma/client';

import { CalendarRepository } from './calendar.repository';

@Injectable()
export class CalendarService {
  constructor(private readonly calendarRepository: CalendarRepository) {}

  async getCalendarById(id: number, userId?: number) {
    const calendar = await this.calendarRepository.findById(id);
    if (!calendar) throw new NotFoundException('Calendar not found');

    if (
      calendar.visibility === Visibility.PRIVATE &&
      calendar.ownerId !== userId
    ) {
      throw new ForbiddenException('Calendar is private');
    }

    return calendar;
  }

  async getMyCalendars(userId: number) {
    return this.calendarRepository.findByOwnerId(userId);
  }

  async getCalendarsByName(name: string) {
    return this.calendarRepository.findByName(name);
  }

  async getAllCalendars() {
    return this.calendarRepository.findAll();
  }

  async getPublicCalendars() {
    return this.calendarRepository.findPublic();
  }

  async createCalendar(data: Prisma.CalendarCreateInput, ownerId: number) {
    return this.calendarRepository.create({
      ...data,
      owner: { connect: { id: ownerId } },
    });
  }

  async updateCalendar(
    id: number,
    userId: number,
    data: Prisma.CalendarUpdateInput,
  ) {
    const calendar = await this.calendarRepository.findById(id);
    if (!calendar) throw new NotFoundException('Calendar not found');

    if (calendar.ownerId !== userId) {
      throw new ForbiddenException('Calendar is private');
    }

    return this.calendarRepository.update(id, data);
  }

  async deleteCalendar(id: number, userId: number) {
    const calendar = await this.calendarRepository.findById(id);
    if (!calendar) throw new NotFoundException('Calendar not found');

    if (calendar.ownerId !== userId) {
      throw new ForbiddenException('Calendar is private');
    }

    return this.calendarRepository.delete(id);
  }
}
