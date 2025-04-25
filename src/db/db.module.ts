import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { ApiConfigModule } from '../config/api-config.module';
import { DatabaseService } from './database.service';
import { DbCronService } from './db-cron.service';
import { BackupService } from './dump/backup.service';

@Module({
  imports: [ApiConfigModule, ScheduleModule],
  exports: [DatabaseService],
  providers: [DatabaseService, DbCronService, BackupService],
})
export class DbModule implements OnApplicationBootstrap {
  constructor(private readonly backup: BackupService) {}

  async onApplicationBootstrap() {
    // await this.backup.downloadSchema();
    // await this.backup.downloadData();
    // await this.backup.downloadTriggers();
  }
}
