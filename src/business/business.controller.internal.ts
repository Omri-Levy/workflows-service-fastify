import { Type } from "@sinclair/typebox";
import { db } from "@/db/client";
import { BusinessFindManyArgs } from "@/business/dtos/business-find-many-args";
import { InputJsonValue } from "@/types";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { isRecordNotFoundError } from "@/db/db.util";
import * as errors from "@/errors";
import { BusinessService } from "@/business/business.service";
import { BusinessRepository } from "@/business/business.repository";
import { BusinessSchema } from "@/common/schemas";

export const businessControllerInternal: FastifyPluginAsyncTypebox = async (fastify) => {
  const businessRepository = new BusinessRepository(
    db
  );
  const businessService = new BusinessService(businessRepository);

  // list
  fastify.get("/",{
    schema: {
      description: "Fetch a list of businesses based on query parameters",
      tags: ["Internal", "Businesses"],
      querystring: BusinessFindManyArgs,
      response: {
        200: Type.Array(Type.Omit(BusinessSchema, ["endUsersOnBusinesses", "workflowRuntimeData", "endUsers"])),
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
    const query: InputJsonValue = {};
    const businesses = await businessService.list({
        ...req.query,
        ...query
      }
    );

    return reply.send(businesses);
  });

  // getById
  fastify.get("/:id", {
    schema: {
      description: "Retrieve a business by its unique ID",
      tags: ["Internal", "Business"],
      params: Type.Object({
        id: Type.String({ description: "Unique ID of the business" })
      }),
      response: {
        200: Type.Omit(BusinessSchema, ["endUsersOnBusinesses", "workflowRuntimeData", "endUsers"]),
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
      const business = await businessService.getById(req.params?.id);

      return reply.send(business);
    } catch (err) {
      if (isRecordNotFoundError(err)) {
        throw new errors.NotFoundException(`No resource was found for ${JSON.stringify(req.params?.id)}`);
      }

      throw err;
    }
  });

};