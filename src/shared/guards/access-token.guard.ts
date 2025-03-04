import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const skipAccessTokenCheck = this.reflector.getAllAndOverride(
      'SkipAccessTokenCheck',
      [context.getHandler(), context.getClass()],
    );

    if (skipAccessTokenCheck) return true;

    return super.canActivate(context);
  }

  handleRequest<TUser = unknown>(
    err: unknown,
    user: unknown,
    info: unknown,
    context: ExecutionContext,
    status?: unknown,
  ): TUser {
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return user as TUser;
    }

    return super.handleRequest(err, user, info, context, status);
  }
}
