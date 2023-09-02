import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import fastifyPassport from "@fastify/passport";
import { LoginRouteInternalSchema } from "@/auth/internal/login/login.schema";

export const loginRouteInternal: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    method: "POST",
    url: "/login",
    schema: LoginRouteInternalSchema,
    preValidation: fastifyPassport.authenticate("local"),
    handler: async (req, reply) => {

      return reply.send({
        user: req.user!
      });
    }
  });
};