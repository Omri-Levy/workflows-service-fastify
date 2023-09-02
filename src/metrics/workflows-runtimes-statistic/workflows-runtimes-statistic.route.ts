import { MetricsRepository } from "@/metrics/metrics.repository";
import { db } from "@/db/client";
import { MetricsService } from "@/metrics/metrics.service";
import {
  WorkflowsRuntimesStatisticRouteSchema
} from "@/metrics/workflows-runtimes-statistic/workflows-runtimes-statistic.schema";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

export const workflowsRuntimesStatisticRoute: FastifyPluginAsyncTypebox = async (app) => {

  const metricsRepository = new MetricsRepository(
    db
  );
  const metricsService = new MetricsService(metricsRepository);

  app.route({
    method: "GET",
    url: "/workflows/runtimes-statistic",
    schema: WorkflowsRuntimesStatisticRouteSchema,
    handler: async (_req, reply) => {
      const runtimesStatistic = await metricsService.listRuntimesStatistic();

      return reply.send(runtimesStatistic);
    }
  });
};