import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { gzipSync } from 'zlib';

import { ApiConfigService } from '../../config/api-config.service';

export const PATH_TO_BACKUPS = join(process.cwd(), 'prisma', 'backups');

interface ConnectionOptions {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
}

@Injectable()
export class BackupService {
  private connection: ConnectionOptions;
  private static instance: BackupService;

  constructor(private readonly cs: ApiConfigService) {
    if (BackupService.instance) return BackupService.instance;

    const config = this.cs.getDB();

    this.connection = {
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.databaseName,
      port: config.port,
    };

    BackupService.instance = this;
  }

  async downloadSchema() {
    this.createPath();
    const filename = `schema_backup_${Date.now()}.sql.gz`;
    const command = this.getPgDumpCommand('--schema-only');
    this.executeBackup(command, filename);
  }

  async downloadData() {
    this.createPath();
    const filename = `data_backup_${Date.now()}.sql.gz`;
    const command = this.getPgDumpCommand('--data-only');
    this.executeBackup(command, filename);
  }

  async downloadTriggers() {
    this.createPath();
    const filename = `triggers_backup_${Date.now()}.sql.gz`;
    const command = this.getPgDumpCommand('--section=post-data');
    this.executeBackup(command, filename);
  }

  private createPath() {
    if (!existsSync(PATH_TO_BACKUPS)) {
      mkdirSync(PATH_TO_BACKUPS, { recursive: true });
    }
  }

  private getPath(filename: string): string {
    return join(PATH_TO_BACKUPS, filename);
  }

  private getPgDumpCommand(option: string): string {
    const { host, user, password, database, port } = this.connection;
    return `PGPASSWORD='${password}' pg_dump -U ${user} -h ${host} -p ${port} -d ${database} ${option}`;
  }

  private executeBackup(command: string, filename: string) {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Backup failed: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      const compressedData = gzipSync(stdout);
      writeFileSync(this.getPath(filename), compressedData);
      console.log(`Backup saved: ${this.getPath(filename)}`);
    });
  }
}
