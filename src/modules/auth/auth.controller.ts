import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetCurrentUser } from 'src/shared/decorators/get-current-user.decorator';
import { Public } from 'src/shared/decorators/public.decorator';
import { SkipAccessTokenCheck } from 'src/shared/decorators/skip-access-token-check.decorator';
import { EmailDto } from 'src/shared/dto/email.dto';
import { RefreshTokenGuard } from 'src/shared/guards/refresh-token.guard';
import { Prefix } from 'src/utils/prefix.enum';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload, JwtPayloadWithRefresh } from './interface/jwt.interface';

@Controller(Prefix.AUTH)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiBearerAuth()
  @SkipAccessTokenCheck()
  @UseGuards(RefreshTokenGuard)
  @Post('logout')
  logout(@GetCurrentUser() dto: JwtPayloadWithRefresh) {
    return this.authService.logout(dto.sub, dto.refreshToken);
  }

  @ApiBearerAuth()
  @SkipAccessTokenCheck()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  refresh(@GetCurrentUser() dto: JwtPayloadWithRefresh) {
    return this.authService.refresh(dto.sub, dto.refreshToken);
  }

  @ApiBearerAuth()
  @Post('activate/:token')
  async activate(
    @Param('token') token: string,
    @GetCurrentUser() { sub }: JwtPayload,
  ) {
    if (!token) {
      throw new BadRequestException('Invalid token');
    }

    return this.authService.activate(token, sub);
  }

  @Public()
  @Post('send-reset-password-link')
  async sendResetPasswordLink(@Body() { email }: EmailDto) {
    return this.authService.sendResetPasswordLink(email);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }
}
