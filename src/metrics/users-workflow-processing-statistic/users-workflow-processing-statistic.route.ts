import {Value} from '@sinclair/typebox/value';
import { MetricsRepository } from "@/metrics/metrics.repository";
import { db } from "@/db/client";
import { MetricsService } from "@/metrics/metrics.service";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import {
  UsersWorkflowProcessingStatisticRouteSchema
} from "@/metrics/users-workflow-processing-statistic/users-workflow-processing-statistic.schema";

export const usersWorkflowProcessingStatisticRoute: FastifyPluginAsyncTypebox = async (app) => {

  const metricsRepository = new MetricsRepository(
    db
  );
  const metricsService = new MetricsService(metricsRepository);

  app.route({
    method: "GET",
    url: "/users/workflow-processing-statistic",
    schema: UsersWorkflowProcessingStatisticRouteSchema,
    handler: async (req, reply) => {
      const userWorkflowProcessingStatistic = await metricsService.getUserWorkflowProcessingStatistic({
        fromDate: Value.Decode(
          UsersWorkflowProcessingStatisticRouteSchema.querystring.properties.fromDate,
          req.query.fromDate
        ),
      });

      return reply.send(userWorkflowProcessingStatistic);
    }
  });
};