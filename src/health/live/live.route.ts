import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { LiveRouteSchema } from "./live.schema";

export const liveRoute: FastifyPluginAsyncTypebox = async (app) => {

  app.route({
    method: "GET",
    url: "/live",
    schema: LiveRouteSchema,
    handler: async (_req, reply) => {
      return reply.status(204).send();
    }
  });
};