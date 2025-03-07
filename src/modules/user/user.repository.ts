import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/db/database.service';

@Injectable()
export class UserRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findById(id: number, select?: Prisma.UserSelect) {
    return this.databaseService.user.findUnique({
      where: {
        id,
      },
      select,
    });
  }

  async findByEmail(email: string, select?: Prisma.UserSelect) {
    return this.databaseService.user.findUnique({
      where: {
        email,
      },
      select,
    });
  }

  async findAll(select?: Prisma.UserSelect) {
    return this.databaseService.user.findMany({
      select,
    });
  }

  async update(
    id: number,
    user: Prisma.UserUpdateInput,
    select?: Prisma.UserSelect,
  ) {
    return this.databaseService.user.update({
      where: { id },
      data: user,
      select,
    });
  }

  async create(user: Prisma.UserCreateInput, select?: Prisma.UserSelect) {
    return this.databaseService.user.create({
      data: user,
      select,
    });
  }
}
