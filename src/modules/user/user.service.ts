import { Injectable } from '@nestjs/common';
import { FileUploadService } from 'src/shared/services/file-upload.service';

import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly fileUploadService: FileUploadService,
  ) {}

  async me(userId: number) {
    return this.userRepository.findById(userId, {
      id: true,
      name: true,
      surname: true,
      email: true,
      avatarUrl: true,
      isActive: true,
    });
  }
}
