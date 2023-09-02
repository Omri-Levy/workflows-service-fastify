import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { UsersRouteSchema } from "@/metrics/users/users.schema";
import { MetricsRepository } from "@/metrics/metrics.repository";
import { db } from "@/db/client";
import { MetricsService } from "@/metrics/metrics.service";

export const usersRoute: FastifyPluginAsyncTypebox = async (app) => {

  const metricsRepository = new MetricsRepository(
    db
  );
  const metricsService = new MetricsService(metricsRepository);

  app.route({
    method: "GET",
    url: "/users",
    schema: UsersRouteSchema,
    handler: async (_req, reply) => {
      const activeUsers = await metricsService.listActiveUsers();

      return reply.send(activeUsers);
    }
  });
};