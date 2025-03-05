import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import * as Joi from 'joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { AccessTokenGuard } from './shared/guards/access-token.guard';
import { LoggerModule } from './shared/logger/logger.module';
import { DatabaseService } from './shared/services/database.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: Joi.object({
        PORT: Joi.number().port().required(),
        DATABASE_URL: Joi.string().uri().required(),
        CLIENT_URL: Joi.string().uri().required(),
        // JWT
        JWT_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_ACTIVE_SECRET: Joi.string().required(),
        JWT_RESET_SECRET: Joi.string().required(),
        // S3
        AWS_ACCESS_KEY: Joi.string().required(),
        AWS_SECRET_KEY: Joi.string().required(),
        AWS_REGION: Joi.string().required(),
        AWS_BUCKET: Joi.string().required(),
        // REDIS
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
        REDIS_PASSWORD: Joi.string().required(),
        REDIS_USER: Joi.string().required(),
        REDIS_USER_PASSWORD: Joi.string().required(),
      }),
    }),
    LoggerModule,
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // typescript is ass
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      useFactory: (configService: ConfigService) => {
        return {
          config: {
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT'),
            password: configService.get('REDIS_USER_PASSWORD'),
            username: configService.get('REDIS_USER'),
          },
        };
      },
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    DatabaseService,
    AppService,
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
  ],
})
export class AppModule {}
