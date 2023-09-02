import { isRecordNotFoundError } from "@/db/db.util";
import { NotFoundError } from "@/common/errors/not-found-error";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { GetFilterByIdRouteInternalSchema } from "@/filter/internal/get-filter-by-id/get-filter-by-id.schema";
import { FilterRepository } from "@/filter/filter.repository";
import { db } from "@/db/client";
import { FilterService } from "@/filter/filter.service";

export const getFilterByIdRouteInternal: FastifyPluginAsyncTypebox = async (app) => {

  const filterRepository = new FilterRepository(
    db
  );
  const filterService = new FilterService(
    filterRepository
  );

  app.route({
    method: "GET",
    url: "/:id",
    schema: GetFilterByIdRouteInternalSchema,
    handler: async (req, reply) => {
      try {
        const filter = await filterService.getById(req.params.id);
        return reply.send(filter);
      } catch (err) {
        if (isRecordNotFoundError(err)) {
          throw new NotFoundError(`No resource was found for ${JSON.stringify(req.params.id)}`);
        }
        throw err;
      }
    }
  });
};