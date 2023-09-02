import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { listFiltersRouteInternal } from "@/filter/internal/list-filters/list-filters.route";
import { getFilterByIdRouteInternal } from "@/filter/internal/get-filter-by-id/get-filter-by-id.route";

export const filterControllerInternal: FastifyPluginAsyncTypebox = async (fastify) => {

  await fastify.register(listFiltersRouteInternal);
  await fastify.register(getFilterByIdRouteInternal);

};