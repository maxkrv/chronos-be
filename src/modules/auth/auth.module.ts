import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MailService } from 'src/shared/services/mail.service';

import { ApiConfigModule } from '../../config/api-config.module';
import { CalendarModule } from '../calendar/calendar.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';

@Module({
  imports: [
    UserModule,
    JwtModule.register({ global: true }),
    ApiConfigModule,
    CalendarModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    MailService,
  ],
})
export class AuthModule {}
