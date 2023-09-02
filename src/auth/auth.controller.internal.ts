import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { loginRouteInternal } from "@/auth/internal/login/login.route";
import { logoutRouteInternal } from "@/auth/internal/logout/logout.route";
import { sessionRouteInternal } from "@/auth/internal/session/session.route";

export const authControllerInternal: FastifyPluginAsyncTypebox = async (fastify) => {

  await fastify.register(loginRouteInternal);
  await fastify.register(logoutRouteInternal);
  await fastify.register(sessionRouteInternal);

};