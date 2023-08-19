import * as Sentry from "@sentry/node";
import FastifyPlugin from 'fastify-plugin';

export const SentryErrorHandlerPlugin = FastifyPlugin(async (fastify) => {
  fastify.addHook("onError", (request, reply, error, done) => {
    Sentry.withScope(scope => {
      if (request.user) {
        scope.setUser({ id: request.user.id });
      }

      Sentry.captureException(error);
    });

    done();
  });
});