import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { createFilterRouteExternal } from "@/filter/external/create-filter/create-filter.route";
import { listFiltersRouteExternal } from "./external/list-filters/list-filters.route";
import { getFilterByIdRouteExternal } from "@/filter/external/get-filter-by-id/get-filter-by-id.route";

export const filterControllerExternal: FastifyPluginAsyncTypebox = async (fastify) => {

  await fastify.register(createFilterRouteExternal);
  await fastify.register(listFiltersRouteExternal);
  await fastify.register(getFilterByIdRouteExternal);

};