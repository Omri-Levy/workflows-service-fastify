import * as errors from "../errors";
import { isRecordNotFoundError } from "@/db/db.util";
import { FilterFindManyArgs } from "@/filter/dtos/filter-find-many-args";
import { FilterService } from "@/filter/filter.service";
import { FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";
import { FilterRepository } from "@/filter/filter.repository";
import { db } from "@/db/client";
import { FilterSchema } from "@/common/schemas";

export const filterControllerInternal: FastifyPluginAsyncTypebox = async (fastify) => {
  const filterRepository = new FilterRepository(
    db
  );
  const filterService = new FilterService(
    filterRepository
  );

  fastify.get("/",
    {
      schema: {
        description: "Fetch a list of filters based on query parameters",
        tags: ["Internal", "Filters"],
        querystring: FilterFindManyArgs,
        response: {
          200: Type.Array(FilterSchema),
          404: Type.Object({
            status: Type.String(),
            message: Type.String()
          }),
          401: Type.Object({
            status: Type.String(),
            message: Type.String()
          }),
          500: Type.Object({
            status: Type.Optional(Type.String()),
            code: Type.Optional(Type.Number()),
            message: Type.String()
          })
        }
      }
    }, async (req, reply) => {
      const filters = await filterService.list(req.query);

      return reply.send(filters);
    });

  fastify.get("/:id", {
    schema: {
      description: "Retrieve a filter by its unique ID",
      tags: ["Internal", "Filter"],
      params: Type.Object({
        id: Type.String({ description: "Unique ID of the filter" })
      }),
      response: {
        200: FilterSchema,
        404: Type.Object({
          status: Type.String(),
          message: Type.String()
        }),
        401: Type.Object({
          status: Type.String(),
          message: Type.String()
        }),
        500: Type.Object({
          status: Type.Optional(Type.String()),
          code: Type.Optional(Type.Number()),
          message: Type.String()
        })
      }
    }
  }, async (req, reply) => {
    try {
      const filter = await filterService.getById(req.params.id);

      return reply.send(filter);
    } catch (err) {
      if (isRecordNotFoundError(err)) {
        throw new errors.NotFoundException(`No resource was found for ${JSON.stringify(req.params.id)}`);
      }

      throw err;
    }
  });
};