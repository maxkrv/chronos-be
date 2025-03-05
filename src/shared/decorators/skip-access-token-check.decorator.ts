import { SetMetadata } from '@nestjs/common';

export const SkipAccessTokenCheck = () =>
  SetMetadata('SkipAccessTokenCheck', true);
