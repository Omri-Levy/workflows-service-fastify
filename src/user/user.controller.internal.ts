import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { createUserRouteInternal } from "@/user/internal/create-user/create-user.route";
import { listUsersRouteInternal } from "@/user/internal/list-users/list-users.route";

export const userControllerInternal: FastifyPluginAsyncTypebox = async (fastify) => {

  await fastify.register(createUserRouteInternal);
  await fastify.register(listUsersRouteInternal);

};