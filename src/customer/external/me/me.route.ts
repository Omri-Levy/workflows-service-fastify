import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { AuthenticatedEntity } from "@/types";
import { MeRouteExternalSchema } from "./me.schema";

export const meRouteExternal: FastifyPluginAsyncTypebox = async (app) => {

  app.route({
    method: "GET",
    url: "/me",
    schema: MeRouteExternalSchema,
    handler: async (req, reply) => {
      return reply.send((req.user as AuthenticatedEntity).customer);
    }
  });
};