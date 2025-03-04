import { Injectable } from '@nestjs/common';
import { FileUploadService } from 'src/shared/services/file-upload.service';

import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly fileUploadService: FileUploadService,
  ) {}
}
