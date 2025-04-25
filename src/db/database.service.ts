import { Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
  async clear() {
    const tables = Prisma.dmmf.datamodel.models
      .map((model) => model.dbName)
      .filter((table) => table);
    await this.$transaction([
      this.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`,
      ...tables.map((table) =>
        this.$executeRawUnsafe(`TRUNCATE \`${table}\`;`),
      ),
      this.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`,
    ]);
  }
}
