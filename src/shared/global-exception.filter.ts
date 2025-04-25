import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request, Response } from 'express';

import { ApiConfigService } from '../config/api-config.service';

export class ExceptionResponse {
  status: number;
  message?: unknown;
  timestamp: string;
  method: string;
  path?: string;
  constructor(data: Partial<ExceptionResponse>) {
    Object.assign(this, data);
  }
}
const UNKNOWN_EXCEPTION_MESSAGE = 'Something went wrong';

@Catch(HttpException)
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly cs: ApiConfigService,
    private readonly httpAdapterHost: HttpAdapterHost,
  ) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const req = host.switchToHttp().getRequest<Request>();
    const { httpAdapter } = this.httpAdapterHost;
    const resp: ExceptionResponse = new ExceptionResponse({
      timestamp: new Date().toISOString(),
      method: httpAdapter.getRequestMethod(req),
      path: !this.cs.isProduction()
        ? httpAdapter.getRequestUrl(req)
        : undefined,
    });

    resp.status = exception.getStatus();
    resp.message = this.cs.isProduction()
      ? resp.status === HttpStatus.NOT_FOUND
        ? 'Not found'
        : UNKNOWN_EXCEPTION_MESSAGE
      : exception.getResponse();

    httpAdapter.reply(
      host.switchToHttp().getResponse<Response>(),
      resp,
      resp.status,
    );
  }
}
