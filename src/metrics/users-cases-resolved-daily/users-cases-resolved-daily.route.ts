import { Value } from "@sinclair/typebox/value";
import {
  UsersCasesResolvedDailyRouteSchema
} from "@/metrics/users-cases-resolved-daily/users-cases-resolved-daily.schema";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { MetricsRepository } from "@/metrics/metrics.repository";
import { db } from "@/db/client";
import { MetricsService } from "@/metrics/metrics.service";

export const usersCasesResolvedDailyRoute: FastifyPluginAsyncTypebox = async (app) => {

  const metricsRepository = new MetricsRepository(
    db
  );
  const metricsService = new MetricsService(metricsRepository);

  app.route({
    method: "GET",
    url: "/users/cases-resolved-daily",
    schema: UsersCasesResolvedDailyRouteSchema,
    handler: async (req, reply) => {
      const userCasesResolvedDaily = await metricsService.listUserCasesResolvedDaily({
        fromDate: Value.Decode(
          UsersCasesResolvedDailyRouteSchema.querystring.properties.fromDate,
          req.query.fromDate
        ),
        userId: req.query.userId
      });

      return reply.send(userCasesResolvedDaily);
    }
  });
};