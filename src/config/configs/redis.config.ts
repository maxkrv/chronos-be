import { registerAs } from '@nestjs/config';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { IRedis } from 'src/config/config.interface';

import { ConfigValidator } from '../config.validator';

const { env } = process;

export class RedisVariables {
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(65535)
  REDIS_PORT: number;

  @IsNotEmpty()
  @IsString()
  REDIS_HOST: string;

  @IsString()
  @IsNotEmpty()
  REDIS_PASS: string;

  @IsString()
  @IsNotEmpty()
  REDIS_USER: string;
}

export const redisConfig = registerAs<IRedis>('redis', () => {
  ConfigValidator.validate(env, RedisVariables);

  return {
    port: Number(env.REDIS_PORT || 6379),
    host: env.REDIS_HOST || 'localhost',
    password: env.REDIS_PASS || 'pass',
    user: env.REDIS_USER || 'root',
  };
});
