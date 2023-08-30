import { isRecordNotFoundError, isUniqueConstraintError } from "@/db/db.util";
import { FilterFindManyArgs } from "@/filter/dtos/filter-find-many-args";
import { FilterService } from "@/filter/filter.service";
import { InputJsonValue } from "@/types";
import { FilterRepository } from "@/filter/filter.repository";
import { db } from "@/db/client";
import { FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";
import { ZodError } from "zod";
import { FilterSchema } from "@/common/schemas";
import { NotFoundError } from "@/common/errors/not-found-error";
import { ZodValidationError } from "@/common/errors/zod-validation-error";
import { BadRequestError } from "@/common/errors/bad-request-error";

import { FilterCreateSchema } from "@/filter/dtos";

export const filterControllerExternal: FastifyPluginAsyncTypebox = async (fastify) => {
  const filterRepository = new FilterRepository(
    db
  );
  const filterService = new FilterService(
    filterRepository
  );

  fastify.post("/", {
    schema: {
      description: "Create a new filter",
      tags: ["External", "Filters"],
      body: Type.Object({
        name: Type.String(),
        entity: Type.Union([Type.Literal("individuals"), Type.Literal("businesses")]),
        query: FilterSchema.properties.query
      }, {
        additionalProperties: false
      }),
      response: {
        201: FilterSchema,
        400: Type.Object({
          status: Type.Optional(Type.String()),
          message: Type.String(),
          errors: Type.Optional(
            Type.Array(
              Type.Object({
                field: Type.String(),
                type: Type.String(),
                message: Type.String()
              })
            )
          )
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
      const data = FilterCreateSchema.parse(req.body);
      const filter = await filterService.create({
        data: {
          ...data,
          query: data?.query as InputJsonValue
        }
      });

      return reply.status(201).send(filter);
    } catch (err) {

      if (isUniqueConstraintError(err)) {
        throw new BadRequestError("Name already in use");
      }

      if (err instanceof ZodError) {
        throw new ZodValidationError(err);
      }

      throw err;
    }
  });

  fastify.get("/",
    {
      schema: {
        description: "Fetch a list of filters based on query parameters",
        tags: ["External", "Filters"],
        querystring: FilterFindManyArgs,
        response: {
          200: Type.Array(FilterSchema),
          400: Type.Object({
            status: Type.String(),
            message: Type.String()
          }),
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
      tags: ["External", "Filter"],
      params: Type.Object({
        id: Type.String({ description: "Unique ID of the filter" })
      }),
      response: {
        200: FilterSchema,
        400: Type.Object({
          status: Type.String(),
          message: Type.String()
        }),
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
        throw new NotFoundError(`No resource was found for ${JSON.stringify(req.params.id)}`);
      }

      throw err;
    }
  });

};