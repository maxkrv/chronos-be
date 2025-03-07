import { registerAs } from '@nestjs/config';
import { IsNotEmpty, IsString } from 'class-validator';

import { IAWS } from '../config.interface';
import { ConfigValidator } from '../config.validator';
const { env } = process;

export class AWSVariables {
  @IsString()
  @IsNotEmpty()
  AWS_S3_REGION: string;

  @IsString()
  @IsNotEmpty()
  AWS_S3_ACCESS_KEY_ID: string;

  @IsString()
  @IsNotEmpty()
  AWS_S3_SECRET_ACCESS_KEY: string;

  @IsString()
  @IsNotEmpty()
  AWS_PUBLIC_BUCKET_NAME: string;
}

export const awsConfig = registerAs<IAWS>('aws', () => {
  ConfigValidator.validate(env, AWSVariables);

  return {
    s3: {
      region: env.AWS_S3_REGION || '',
      keyId: env.AWS_S3_ACCESS_KEY_ID || '',
      secretKey: env.AWS_S3_SECRET_ACCESS_KEY || '',
      bucketName: env.AWS_PUBLIC_BUCKET_NAME || '',
    },
  };
});
