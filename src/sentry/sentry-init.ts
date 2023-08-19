import * as Sentry from "@sentry/node";
import { RewriteFrames } from "@sentry/integrations";
import { env } from "@/env";

export const sentryInit = () => {
  if (!env.SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    debug: env.NODE_ENV !== "production",
    environment: env.NODE_ENV,
    integrations: [
      new RewriteFrames({
        root: global.__rootdir__
      })
    ]
  });

};
