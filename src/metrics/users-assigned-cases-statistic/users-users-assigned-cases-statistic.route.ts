import { Value } from "@sinclair/typebox/value";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import {
  UsersAssignedCasesStatisticRouteSchema
} from "@/metrics/users-assigned-cases-statistic/users-users-assigned-cases-statistic.schema";
import { MetricsRepository } from "@/metrics/metrics.repository";
import { db } from "@/db/client";
import { MetricsService } from "@/metrics/metrics.service";

export const usersAssignedCasesStatisticRoute: FastifyPluginAsyncTypebox = async (app) => {

  const metricsRepository = new MetricsRepository(
    db
  );
  const metricsService = new MetricsService(metricsRepository);

  app.route({
    method: "GET",
    url: "/users/users-assigned-cases-statistic",
    schema: UsersAssignedCasesStatisticRouteSchema,
    handler: async (req, reply) => {
      const usersAssignedCasesStatistic = await metricsService.listUsersAssignedCasesStatistic({
        fromDate: Value.Decode(
          UsersAssignedCasesStatisticRouteSchema.querystring.properties.fromDate,
          req.query.fromDate
        )
      });

      return reply.send(usersAssignedCasesStatistic);
    }
  });
};