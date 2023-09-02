import { ListFiltersRouteExternalSchema } from "@/filter/external/list-filters/list-filters.schema";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { FilterRepository } from "@/filter/filter.repository";
import { db } from "@/db/client";
import { FilterService } from "@/filter/filter.service";

export const listFiltersRouteExternal: FastifyPluginAsyncTypebox = async (app) => {

  const filterRepository = new FilterRepository(
    db
  );
  const filterService = new FilterService(
    filterRepository
  );

  app.route({
    method: "GET",
    url: "/",
    schema: ListFiltersRouteExternalSchema,
    handler: async (req, reply) => {
      const filters = await filterService.list(req.query);
      return reply.send(filters);
    }
  });
};