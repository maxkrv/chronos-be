import { registerAs } from '@nestjs/config';
import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { IPostgeSql } from 'src/config/config.interface';

import { ConfigValidator } from '../config.validator';

const { env } = process;

export class DBVariables {
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(65535)
  DB_PORT: number;

  @IsNotEmpty()
  @IsString()
  DB_HOST: string;

  @IsString()
  @IsNotEmpty()
  DB_PASS: string;

  @IsString()
  @IsNotEmpty()
  DB_USER: string;

  @IsString()
  @IsNotEmpty()
  DB_NAME: string;
}

export const postgeSqlConfig = registerAs<IPostgeSql>('postgresql', () => {
  ConfigValidator.validate(env, DBVariables);

  return {
    port: Number(env.DB_PORT || 5432),
    host: env.DB_HOST || 'localhost',
    password: env.DB_PASS || 'pass',
    user: env.DB_USER || 'root',
    databaseName: env.DB_NAME || '',
  };
});
