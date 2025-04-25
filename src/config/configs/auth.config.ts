import { registerAs } from '@nestjs/config';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { IAuth } from '../config.interface';
import { ConfigValidator } from '../config.validator';
const { env } = process;

export class AuthVariables {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  MAIL_VERIFICATION_TOKEN_TIME: string;

  @IsString()
  @IsOptional()
  MAIL_VERIFICATION_TOKEN_SECRET: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  MAIL_RESET_PASS_TOKEN_TIME?: string;

  @IsString()
  @IsNotEmpty()
  MAIL_RESET_PASS_TOKEN_SECRET: string;

  @IsString()
  @IsNotEmpty()
  AUTH_GOOGLE_APP_ID: string;

  @IsString()
  @IsNotEmpty()
  AUTH_GOOGLE_APP_SECRET: string;

  @IsString()
  @IsNotEmpty()
  AUTH_GOOGLE_CALLBACK: string;
}

export const authConfig = registerAs<IAuth>('auth', () => {
  ConfigValidator.validate(env, AuthVariables);

  return {
    mail: {
      jwt: {
        verification: {
          time: env.MAIL_VERIFICATION_TOKEN_TIME || '20m',
          secret: env.MAIL_VERIFICATION_TOKEN_SECRET ?? '',
        },
        resetPass: {
          time: env.MAIL_RESET_PASS_TOKEN_TIME || '10m',
          secret: env.MAIL_RESET_PASS_TOKEN_SECRET ?? '',
        },
      },
    },
    google: {
      clientId: env.AUTH_GOOGLE_APP_ID || '',
      clientSecret: env.AUTH_GOOGLE_APP_SECRET || '',
      callbackURL: env.AUTH_GOOGLE_CALLBACK || '',
    },
  };
});
