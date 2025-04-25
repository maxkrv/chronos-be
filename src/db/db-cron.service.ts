import { Injectable } from '@nestjs/common';

import { BackupService } from './dump/backup.service';

@Injectable()
export class DbCronService {
  constructor(private readonly backupServive: BackupService) {}

  // @Cron(CronExpression.EVERY_HOUR)
  // public async dataBackup(): Promise<void> {
  //   await this.backupServive.downloadData();
  // }

  // @Cron(CronExpression.EVERY_6_HOURS)
  // public async schemaBackup(): Promise<void> {
  //   await this.backupServive.downloadSchema();
  // }

  // @Cron(CronExpression.EVERY_3_HOURS)
  // public async triggersBackup(): Promise<void> {
  //   await this.backupServive.downloadTriggers();
  // }
}
