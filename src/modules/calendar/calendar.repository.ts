import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/db/database.service';

@Injectable()
export class CalendarRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findById(id: number, select?: Prisma.CalendarSelect) {
    return this.databaseService.calendar.findUnique({
      where: {
        id,
      },
      select,
    });
  }

  async findByOwnerId(ownerId: number, select?: Prisma.CalendarSelect) {
    return this.databaseService.calendar.findMany({
      where: { ownerId },
      select,
    });
  }

  async findByName(name: string, select?: Prisma.CalendarSelect) {
    return this.databaseService.calendar.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
      select,
    });
  }

  async findAll(select?: Prisma.CalendarSelect) {
    return this.databaseService.calendar.findMany({
      select,
    });
  }

  async findPublic(select?: Prisma.CalendarSelect) {
    return this.databaseService.calendar.findMany({
      where: {
        visibility: 'PUBLIC',
      },
      select,
    });
  }

  async create(
    calendar: Prisma.CalendarCreateInput,
    select?: Prisma.CalendarSelect,
  ) {
    return this.databaseService.calendar.create({
      data: calendar,
      select,
    });
  }

  async update(
    id: number,
    calendar: Prisma.CalendarUpdateInput,
    select?: Prisma.CalendarSelect,
  ) {
    return this.databaseService.calendar.update({
      where: { id },
      data: calendar,
      select,
    });
  }

  async delete(id: number) {
    return this.databaseService.calendar.delete({
      where: { id },
    });
  }
}
