import { z } from 'zod';

export const LogSchema = z
  .object({
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
      .default('info')
      .describe('Log level'),

    LOG_ENABLE_PRETTY: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true')
      .describe('Pretty print logs. Should be disabled in production'),
  })
  .transform((data) => {
    return {
      level: data.LOG_LEVEL,
      enablePretty: data.LOG_ENABLE_PRETTY,
    };
  });
