import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { getBusinessByIdRouteExternal } from "@/business/external/get-business-by-id/get-business-by-id.route";
import { listBusinessesRouteInternal } from "@/business/internal/list-business-by-id/list-businesses.route";

export const businessControllerInternal: FastifyPluginAsyncTypebox = async (fastify) => {

  await fastify.register(getBusinessByIdRouteExternal);
  await fastify.register(listBusinessesRouteInternal);

};