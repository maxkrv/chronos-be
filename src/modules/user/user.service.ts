import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { FileUploadService } from 'src/shared/services/file-upload.service';

import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly fileUploadService: FileUploadService,
  ) {}

  private USER_SELECT: Prisma.UserSelect = {
    id: true,
    name: true,
    surname: true,
    email: true,
    avatarUrl: true,
    isActive: true,
    countryCode: true,
  };

  async me(userId: number) {
    return this.userRepository.findById(userId, this.USER_SELECT);
  }

  async updateAvatar(userId: number, file: Express.Multer.File) {
    const { location: avatarUrl } =
      await this.fileUploadService.uploadFile(file);

    await this.userRepository.update(userId, {
      avatarUrl,
    });

    return {
      avatarUrl,
    };
  }

  async update(userId: number, dto: UpdateUserDto) {
    await this.userRepository.update(userId, dto, this.USER_SELECT);
  }
}
