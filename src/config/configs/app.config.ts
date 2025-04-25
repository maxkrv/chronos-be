import { registerAs } from '@nestjs/config';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

import { Env, IApp } from '../config.interface';
import { ConfigValidator } from '../config.validator';
const { env } = process;

export class AppVariables {
  @IsEnum(Env)
  NODE_ENV: Env;

  @IsInt()
  @Min(0)
  @Max(65535)
  PORT: number;

  @IsUrl({ require_tld: false })
  CLIENT_URL: string;

  @IsUrl({ require_tld: false })
  NAGER_DATE_API: string;

  @IsString()
  @IsNotEmpty()
  JWT_ACCESS_TOKEN_SECRET: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  JWT_ACCESS_TOKEN_TIME?: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_TOKEN_SECRET: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  JWT_REFRESH_TOKEN_TIME: string;

  @IsInt()
  @IsOptional()
  THROTTLE_TTL: number;

  @IsInt()
  @IsOptional()
  THROTTLE_LIMIT: number;
}

export const appConfig = registerAs<IApp>('app', () => {
  ConfigValidator.validate(env, AppVariables);

  return {
    env: env.NODE_ENV as Env,
    port: +(env.PORT || 6969),
    clientUrl: env.CLIENT_URL || '',
    nagerUrl: env.NAGER_DATE_API || '',
    jwt: {
      accessToken: {
        secret: env.JWT_ACCESS_TOKEN_SECRET || '',
        time: env.JWT_ACCESS_TOKEN_TIME || '15m',
      },
      refreshToken: {
        secret: env.JWT_REFRESH_TOKEN_SECRET || '',
        time: env.JWT_REFRESH_TOKEN_TIME || '7d',
      },
    },
    throttle: {
      ttl: +(env.THROTTLE_TTL || 50),
      limit: +(env.THROTTLE_LIMIT || 10),
    },
  };
});
