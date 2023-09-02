import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { ListFiltersRouteInternalSchema } from "@/filter/internal/list-filters/list-filters.schema";
import { FilterRepository } from "@/filter/filter.repository";
import { db } from "@/db/client";
import { FilterService } from "@/filter/filter.service";

export const listFiltersRouteInternal: FastifyPluginAsyncTypebox = async (app) => {

  const filterRepository = new FilterRepository(
    db
  );
  const filterService = new FilterService(
    filterRepository
  );

  app.route({
    method: "GET",
    url: "/",
    schema: ListFiltersRouteInternalSchema,
    handler: async (req, reply) => {
      const filters = await filterService.list(req.query);

      return reply.send(filters);
    }
  });
};