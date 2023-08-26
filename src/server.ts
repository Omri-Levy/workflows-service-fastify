import multer from "fastify-multer";
import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/session";
import cors from "@fastify/cors";
import fastify, { FastifyPluginAsync } from "fastify";
import helmet from "@fastify/helmet";
import { env } from "@/env";
import { endUserControllerInternal } from "@/end-user/end-user.controller.internal";
import { endUserControllerExternal } from "@/end-user/end-user.controller.external";
import { businessControllerInternal } from "@/business/business.controller.internal";
import { authControllerInternal } from "@/auth/auth.controller.internal";
import { businessControllerExternal } from "@/business/business.controller.external";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { storageControllerInternal } from "./storage/storage.controller.internal";
import { storageControllerExternal } from "@/storage/storage.controller.external";
import { metricsController } from "@/metrics/metrics.controller";
import { SwaggerPlugin } from "./lib/swagger/swagger-plugin";
import { LoggingPlugin } from "./lib/logging/logging-plugin";
import { RequestContextPlugin } from "./lib/request-context/request-context-plugin";
import { randomUUID } from "node:crypto";
import { filterControllerExternal } from "@/filter/filter.controller.external";
import { filterControllerInternal } from "@/filter/filter.controller.internal";
import { userControllerInternal } from "@/user/user.controller.internal";
import { healthController } from "@/health/health.controller";
import { SentryErrorHandlerPlugin } from "@/sentry/sentry-plugin";
import { sentryInit } from "@/sentry/sentry-init";
import { workflowsControllerExternal } from "@/workflow/workflow.controller.external";
import { workflowsControllerInternal } from "@/workflow/workflow.controller.internal";
import qs from "qs";
import { ErrorHandlerPlugin } from "@/common/errors/error-handler-plugin";
import fastifyPassport from "@fastify/passport";
import {
  PassportSessionSerializerPlugin
} from "@/auth/passport-session-serializer-plugin";
import { PassportLocalStrategy } from "@/auth/passport-local-strategy";
import { authPreHandler } from "@/auth/auth-pre-handler";

// This line is used to improve Sentry's stack traces
// https://docs.sentry.io/platforms/node/typescript/#changing-events-frames
global.__rootdir__ = __dirname || process.cwd();

if (env.SENTRY_DSN) {
  sentryInit();
}

export const build = async () => {
  const app = fastify({
    requestIdHeader: false,
    genReqId: () => randomUUID(),
    bodyLimit: Number.MAX_VALUE, // Body limit is configured in Nginx,
    querystringParser: (string_) => qs.parse(string_)
  });

  app.setErrorHandler(ErrorHandlerPlugin);
  app.withTypeProvider<TypeBoxTypeProvider>();

  // This must register first
  if (env.SENTRY_DSN) {
    await app.register(SentryErrorHandlerPlugin);
  }
  await app.register(RequestContextPlugin);
  await app.register(LoggingPlugin);
  await app.register(SwaggerPlugin);
  await app.register(cors, {
    origin: env.NODE_ENV === "production"
      ? [env.BACKOFFICE_CORS_ORIGIN, env.WORKFLOW_DASHBOARD_CORS_ORIGIN, /\.ballerine\.app$/]
      : [
        env.BACKOFFICE_CORS_ORIGIN,
        env.HEADLESS_EXAMPLE_CORS_ORIGIN,
        env.WORKFLOW_DASHBOARD_CORS_ORIGIN,
        /\.ballerine\.dev$/,
        /\.ballerine\.app$/
      ],
    credentials: true
  });
  await app.register(helmet);
  await app.register(multer.contentParser);

  await app.register(fastifyCookie);
  await app.register(fastifySession, {
    cookieName: "session",
    secret: env.SESSION_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 1 // 1 hour
    }
  });

  // if (config.validateHttpResponses) {
  //   await app.register(ResponseValidationPlugin);
  // }

  app.addHook("preHandler", (req, reply, done) => {
    if (!req.session) return done();

    // @ts-ignore
    req.session.nowInMinutes = Math.floor(Date.now() / 60e3);
    done();
  });

  // register regenerate & save after the cookieSession middleware initialization
  app.addHook("preHandler", (req, reply, done) => {
    if (req.session && !req.session.regenerate) {
      // @ts-ignore
      req.session.regenerate = () => {
        return;
      };
    }
    if (req.session && !req.session.save) {
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/ban-types
      req.session.save = (cb: Function) => {
        cb();
      };
    }
    done();
  });

  await app.register(fastifyPassport.initialize());
  await app.register(fastifyPassport.secureSession());
  await app.register(PassportSessionSerializerPlugin);

  fastifyPassport.use(PassportLocalStrategy);

  const internalRouter: FastifyPluginAsync = async (fastify) => {

    fastify.addHook('preHandler', authPreHandler);

    await fastify.register(filterControllerInternal, { prefix: "/filters" });
    await fastify.register(storageControllerInternal, { prefix: "/storage" });
    await fastify.register(endUserControllerInternal, { prefix: "/end-users" });
    await fastify.register(businessControllerInternal, { prefix: "/businesses" });
    await fastify.register(userControllerInternal, { prefix: "/users" });
    await fastify.register(authControllerInternal, { prefix: "/auth" });
    await fastify.register(workflowsControllerInternal, { prefix: "/workflows" });

  };
  const externalRouter: FastifyPluginAsync = async (fastify) => {

    await fastify.register(filterControllerExternal, { prefix: "/filters" });
    await fastify.register(storageControllerExternal, { prefix: "/storage" });
    await fastify.register(endUserControllerExternal, { prefix: "/end-users" });
    await fastify.register(businessControllerExternal, { prefix: "/businesses" });
    await fastify.register(workflowsControllerExternal, { prefix: "/workflows" });

  };

  const v1Router: FastifyPluginAsync = async (fastify) => {

    await fastify.register(metricsController, { prefix: "/metrics" });
    await fastify.register(internalRouter, { prefix: "/internal" });
    await fastify.register(externalRouter, { prefix: "/external" });
    await fastify.register(healthController, { prefix: "/health" });

  };

  await app.register(v1Router, { prefix: "/api/v1" });

  app.ready((err) => {
    if (err) throw err;

    if (env.NODE_ENV === "test") return;

    console.log(app.printRoutes());
  });

  return app;
};