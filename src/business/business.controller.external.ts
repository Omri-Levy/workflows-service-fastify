import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { createBusinessRouteExternal } from "@/business/external/create-business/create-business.route";
import {
  listWorkflowsByBusinessIdRouteExternal
} from "@/business/external/list-workflows-by-business-id/list-workflows-by-business-id.route";
import { getBusinessByIdRouteExternal } from "@/business/external/get-business-by-id/get-business-by-id.route";
import { listBusinessesRouteExternal } from "@/business/external/list-businesses/list-businesses.route";

export const businessControllerExternal: FastifyPluginAsyncTypebox = async (fastify) => {

  await fastify.register(createBusinessRouteExternal);
  await fastify.register(listBusinessesRouteExternal);
  await fastify.register(getBusinessByIdRouteExternal);
  await fastify.register(listWorkflowsByBusinessIdRouteExternal);

};