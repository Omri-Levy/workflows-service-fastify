import { FilterCreateSchema } from "@/filter/dtos";
import { InputJsonValue } from "@/types";
import { isUniqueConstraintError } from "@/db/db.util";
import { BadRequestError } from "@/common/errors/bad-request-error";
import { ZodValidationError } from "@/common/errors/zod-validation-error";
import { CreateFilterRouteExternalSchema } from "@/filter/external/create-filter/create-filter.schema";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { FilterRepository } from "@/filter/filter.repository";
import { db } from "@/db/client";
import { FilterService } from "@/filter/filter.service";
import { ZodError } from "zod";

export const createFilterRouteExternal: FastifyPluginAsyncTypebox = async (app) => {

  const filterRepository = new FilterRepository(
    db
  );
  const filterService = new FilterService(
    filterRepository
  );

  app.route({
    method: "POST",
    url: "/",
    schema: CreateFilterRouteExternalSchema,
    handler: async (req, reply) => {
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
    }
  });
};


