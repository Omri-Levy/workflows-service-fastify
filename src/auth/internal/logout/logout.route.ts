import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { LogoutRouteInternalSchema } from "@/auth/internal/logout/logout.schema";

export const logoutRouteInternal: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    method: "POST",
    url: "/logout",
    schema: LogoutRouteInternalSchema,
    handler: async (req, reply) => {

      await req.logOut();

      await reply.clearCookie("session", { path: "/", httpOnly: true });
      await reply.clearCookie("session.sig", { path: "/", httpOnly: true });

      return reply.send({ user: null });
    }
  });
};