import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ApiConfigService } from './api-config.service';
import { appConfig } from './configs/app.config';
import { authConfig } from './configs/auth.config';
import { awsConfig } from './configs/aws.config';
import { postgeSqlConfig } from './configs/db.config';
import { mailConfig } from './configs/mail.config';
import { redisConfig } from './configs/redis.config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        authConfig,
        mailConfig,
        awsConfig,
        appConfig,
        postgeSqlConfig,
        redisConfig,
      ],
    }),
  ],
  exports: [ApiConfigService],
  providers: [ApiConfigService],
})
export class ApiConfigModule {}
