import { MetricsRepository } from "@/metrics/metrics.repository";
import { db } from "@/db/client";
import { MetricsService } from "@/metrics/metrics.service";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Value } from "@sinclair/typebox/value";
import {
  UsersResolvedCasesStatisticRouteSchema
} from "@/metrics/users-resolved-cases-statistic/users-resolved-cases-statistic.schema";

export const usersResolvedCasesStatisticRoute: FastifyPluginAsyncTypebox = async (app) => {

  const metricsRepository = new MetricsRepository(
    db
  );
  const metricsService = new MetricsService(metricsRepository);

  app.route({
    method: "GET",
    url: "/users/users-resolved-cases-statistic",
    schema: UsersResolvedCasesStatisticRouteSchema,
    handler: async (req, reply) => {
      const usersResolvedCasesStatistic = await metricsService.getUserWorkflowProcessingStatistic({
        fromDate: Value.Decode(
          UsersResolvedCasesStatisticRouteSchema.querystring.properties.fromDate,
          req.query.fromDate
        ),
      });

      return reply.send(usersResolvedCasesStatistic);
    }
  });
};