import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { tap } from 'rxjs';
import { Response } from 'express';
import { logger } from '@/lib/logging/logger';

@Injectable()
export class LogRequestInterceptor implements NestInterceptor {
  constructor() {}

  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<Response>();

        logger.info(`Outgoing response`, {
          request: {
            id: response.req.id,
          },
          response: {
            statusCode: response.statusCode,
          },
          responseTime: Date.now() - response.req.startTime,
        });
      }),
    );
  }
}
