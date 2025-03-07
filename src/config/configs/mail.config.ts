import { registerAs } from '@nestjs/config';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import { IMail } from '../config.interface';
import { ConfigValidator } from '../config.validator';
const { env } = process;

export class MailVariables {
  @IsString()
  @IsNotEmpty()
  MAIL_HOST: string;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  MAIL_PORT: number;

  @IsBoolean()
  @IsOptional()
  MAIL_SECURE?: boolean;

  @IsString()
  @IsNotEmpty()
  MAIL_AUTH_USER: string;

  @IsString()
  @IsNotEmpty()
  MAIL_AUTH_PASS: string;

  @IsString()
  @IsNotEmpty()
  MAIL_FROM_NAME: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  MAIL_FROM_ADDRESS?: string;
}

export const mailConfig = registerAs<IMail>('mail', () => {
  ConfigValidator.validate(env, MailVariables);

  return {
    host: env.MAIL_HOST || '',
    port: +(env.MAIL_PORT || 465),
    secure: !!(env.MAIL_SECURE ?? true),
    auth: {
      user: env.MAIL_AUTH_USER || '',
      pass: env.MAIL_AUTH_PASS || '',
    },
    from: {
      name: env.MAIL_FROM_NAME || '',
      address: env.MAIL_FROM_ADDRESS ?? (env.MAIL_AUTH_USER || ''),
    },
  };
});
