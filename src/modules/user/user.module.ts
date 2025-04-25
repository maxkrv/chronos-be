import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/db/database.service';
import { FileUploadService } from 'src/shared/services/file-upload.service';

import { ApiConfigModule } from '../../config/api-config.module';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [
    DatabaseService,
    UserService,
    UserRepository,
    FileUploadService,
    ApiConfigModule,
  ],
  exports: [UserRepository],
})
export class UserModule {}
