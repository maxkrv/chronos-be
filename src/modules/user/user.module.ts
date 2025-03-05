import { Module } from '@nestjs/common';
import { DatabaseService } from 'src/shared/services/database.service';
import { FileUploadService } from 'src/shared/services/file-upload.service';

import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [DatabaseService, UserService, UserRepository, FileUploadService],
  exports: [UserRepository],
})
export class UserModule {}
