import {Value} from '@sinclair/typebox/value';
import { MetricsRepository } from "@/metrics/metrics.repository";
import { db } from "@/db/client";
import { MetricsService } from "@/metrics/metrics.service";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import {
  WorkflowsRuntimesStatusCountRouteSchema
} from "@/metrics/workflows-runtimes-status-count/workflows-runtimes-status-count.schema";

export const workflowsRuntimesStatusCountRoute: FastifyPluginAsyncTypebox = async (app) => {

  const metricsRepository = new MetricsRepository(
    db
  );
  const metricsService = new MetricsService(metricsRepository);

  app.route({
    method: "GET",
    url: "/workflows/runtimes-status-count",
    schema: WorkflowsRuntimesStatusCountRouteSchema,
    handler: async (req, reply) => {
      const runtimesStatusCount = await metricsService.getRuntimesStatusCaseCount({
        fromDate: Value.Decode(
          WorkflowsRuntimesStatusCountRouteSchema.querystring.properties.fromDate,
          req.query.fromDate
        ),
      });

      return reply.send(runtimesStatusCount);
    }
  });
};