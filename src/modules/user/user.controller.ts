import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetCurrentUser } from 'src/shared/decorators/get-current-user.decorator';

import { JwtPayload } from '../auth/interface/jwt.interface';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @Get('me')
  async me(@GetCurrentUser() { sub }: JwtPayload) {
    return this.userService.me(sub);
  }
}
