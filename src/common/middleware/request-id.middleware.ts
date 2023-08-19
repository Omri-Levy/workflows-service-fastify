import { Injectable, NestMiddleware, Scope } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { logger } from "@/lib/logging/logger";

@Injectable({ scope: Scope.REQUEST })
export class RequestIdMiddleware implements NestMiddleware {
  constructor() {}

  use(request: Request, response: Response, next: NextFunction) {
    request.id = randomUUID();
    request.startTime = Date.now();

    const cleanHeaders = { ...request.headers };
    delete cleanHeaders.authorization;
    delete cleanHeaders.cookie;

    logger.info(`Incoming request`, {
      request: {
        id: request.id,
        method: request.method,
        path: request.originalUrl,
        headers: cleanHeaders,
      },
    });

    next();
  }
}
