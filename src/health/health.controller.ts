import { HealthService } from "./health.service";
import { FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";
import { db } from "@/db/client";

export const healthController: FastifyPluginAsyncTypebox = async (fastify) => {
  const healthService = new HealthService(db);

  // healthLive
  fastify.get("/live", {
    schema: {
      description: "Checks if the service is live.",
      tags: ["Health"],
      response: {
        204: {
          type: "null",
          description: "The service is live."
        },
        500: Type.Object({
          status: Type.Optional(Type.String()),
          code: Type.Optional(Type.Number()),
          message: Type.String()
        })
      }
    }
  }, async (_req, reply) => {
    return reply.status(204).send();
  });

  // healthReady
  fastify.get("/ready", {
    schema: {
      description: "Checks if the service is ready, specifically if the database is ready.",
      tags: ["Health"],
      response: {
        204: {
          type: "null",
          description: "The service is ready."
        },
        404: {
          type: "null",
          description: "The service is not ready."
        },
        500: Type.Object({
          status: Type.Optional(Type.String()),
          code: Type.Optional(Type.Number()),
          message: Type.String()
        })
      }
    }
  }, async (_req, reply) => {
    const dbConnection = await healthService.isDbReady();

    if (!dbConnection) {
      return reply.code(404).send();
    }

    return reply.status(204).send();
  });
};

