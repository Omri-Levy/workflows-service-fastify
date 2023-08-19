import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import { Response } from 'express';
import { logger } from "@/lib/logging/logger";

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  constructor(applicationRef?: HttpAdapterHost) {
    super(applicationRef?.httpAdapter);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    // if (host.getType() === 'http') return;
    logger.error('Global error handler: ', exception);
    super.catch(exception, host);

    const response = host.switchToHttp().getResponse<Response>();

    logger.info(`Outgoing response`, {
      request: {
        id: response.req.id,
      },
      response: {
        statusCode: response.statusCode,
      },
      responseTime: Date.now() - response.req.startTime,
    });
  }
}
