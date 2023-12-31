import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { listEndUsersRouteExternal } from "@/end-user/external/list-end-users/list-end-users.route";
import { createEndUserRouteExternal } from "@/end-user/external/create-end-user/create-end-user.route";
import { getEndUserByIdRouteExternal } from "@/end-user/external/get-end-user-by-id/get-end-user-by-id.route";
import {
  listWorkflowsByEndUserIdRouteExternal
} from "@/end-user/external/list-workflows-by-end-user-id/list-workflows-by-end-user-id.route";

export const endUserControllerExternal: FastifyPluginAsyncTypebox = async (fastify) => {

  await fastify.register(createEndUserRouteExternal);
  await fastify.register(listEndUsersRouteExternal);
  await fastify.register(getEndUserByIdRouteExternal);
  await fastify.register(listWorkflowsByEndUserIdRouteExternal);

};