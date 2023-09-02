import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { listEndUsersRouteInternal } from "@/end-user/internal/list-end-users/list-end-users.route";
import { getEndUserByIdRouteInternal } from "@/end-user/internal/get-end-user-by-id/get-end-user-by-id.route";

export const endUserControllerInternal: FastifyPluginAsyncTypebox = async (fastify) => {

  await fastify.register(listEndUsersRouteInternal);
  await fastify.register(getEndUserByIdRouteInternal);

};