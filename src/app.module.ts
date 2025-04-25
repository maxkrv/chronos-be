import { RedisModule } from '@liaoliaots/nestjs-redis';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import cors from 'cors';
import helmet from 'helmet';
import { LoggerErrorInterceptor } from 'nestjs-pino';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiConfigModule } from './config/api-config.module';
import { ApiConfigService } from './config/api-config.service';
import { DatabaseService } from './db/database.service';
import { DbModule } from './db/db.module';
import { AuthModule } from './modules/auth/auth.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { CalendarInvitationsModule } from './modules/calendar-invitations/calendar-invitations.module';
import { CalendarUsersModule } from './modules/calendar-users/calendar-users.module';
import { EventModule } from './modules/event/event.module';
import { EventInvitationsModule } from './modules/event-invitations/event-invitations.module';
import { EventUsersModule } from './modules/event-users/event-users.module';
import { GlobalExceptionFilter } from './shared/global-exception.filter';
import { AccessTokenGuard } from './shared/guards/access-token.guard';
import { LoggerModule } from './shared/logger/logger.module';

@Module({
  imports: [
    ApiConfigModule,
    LoggerModule,
    AuthModule,
    CalendarModule,
    EventModule,
    CalendarInvitationsModule,
    EventInvitationsModule,
    CalendarUsersModule,
    EventUsersModule,
    DbModule,
    ScheduleModule.forRoot(),
    ThrottlerModule.forRootAsync({
      imports: [ApiConfigModule],
      inject: [ApiConfigService],
      useFactory: (cs: ApiConfigService) => ({
        throttlers: [cs.getApp().throttle],
      }),
    }),
    RedisModule.forRootAsync({
      imports: [ApiConfigModule],
      inject: [ApiConfigService],
      // typescript is ass
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      useFactory: (cs: ApiConfigService) => {
        return {
          config: cs.getRedis(),
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    DatabaseService,
    AppService,
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          transform: true,
          validateCustomDecorators: true,
          whitelist: true,
        }),
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    { provide: APP_INTERCEPTOR, useClass: LoggerErrorInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cors({ credentials: true }), helmet()).forRoutes('*');
  }
}
