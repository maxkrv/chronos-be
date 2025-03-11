import {
  Body,
  Controller,
  Get,
  HttpStatus,
  ParseFilePipeBuilder,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import {
  IMG_ALLOWED_TYPES,
  IMG_MAX_SIZE,
} from 'src/shared/constants/constants';
import { GetCurrentUser } from 'src/shared/decorators/get-current-user.decorator';
import {
  UploadFileSizeValidator,
  UploadFileTypeValidator,
} from 'src/shared/validators';
import { Prefix } from 'src/utils/prefix.enum';

import { JwtPayload } from '../auth/interface/jwt.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller(Prefix.USERS)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @Get('me')
  async me(@GetCurrentUser() { sub }: JwtPayload) {
    return this.userService.me(sub);
  }

  @ApiBearerAuth()
  @Patch('me')
  async update(
    @Body() dto: UpdateUserDto,
    @GetCurrentUser() { sub }: JwtPayload,
  ) {
    return this.userService.update(sub, dto);
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('avatar'))
  @Patch('/avatar')
  async updateAvatar(
    @GetCurrentUser() { sub }: JwtPayload,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addValidator(
          new UploadFileTypeValidator({ fileType: IMG_ALLOWED_TYPES }),
        )
        .addValidator(new UploadFileSizeValidator({ maxSize: IMG_MAX_SIZE }))
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: true,
        }),
    )
    avatar: Express.Multer.File,
  ) {
    return this.userService.updateAvatar(sub, avatar);
  }
}
