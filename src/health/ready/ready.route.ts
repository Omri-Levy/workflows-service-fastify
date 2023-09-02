import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { ReadyRouteSchema } from "@/health/ready/ready.schema";
import { HealthService } from "@/health/health.service";
import { db } from "@/db/client";

export const readyRoute: FastifyPluginAsyncTypebox = async (app) => {

  const healthService = new HealthService(db);

  app.route({
    method: "GET",
    url: "/ready",
    schema: ReadyRouteSchema,
    handler: async (_req, reply) => {
      const dbConnection = await healthService.isDbReady();

      if (!dbConnection) {
        return reply.status(404).send();
      }

      return reply.status(204).send();
    }
  });
};