import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { SessionRouteInternalSchema } from "@/auth/internal/session/session.schema";

export const sessionRouteInternal: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    method: "GET",
    url: "/session",
    schema: SessionRouteInternalSchema,
    handler: async (req, reply) => {

      return reply.send({
        user: req?.user ?? null
      });
    }})
};