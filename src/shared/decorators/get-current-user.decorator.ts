import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
  JwtPayload,
  JwtPayloadWithRefresh,
} from 'src/modules/auth/interface/jwt.interface';

export const GetCurrentUser = createParamDecorator(
  (
    data: keyof JwtPayloadWithRefresh | keyof JwtPayload | undefined,
    context: ExecutionContext,
  ) => {
    const request = context.switchToHttp().getRequest();
    if (!data) return request.user;
    return request.user[data];
  },
);
