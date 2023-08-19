import { EndUserService } from "@/end-user/end-user.service";
import { EndUserRepository } from "@/end-user/end-user.repository";
import { db } from "@/db/client";
import { EndUserFindManyArgs } from "@/end-user/dtos/end-user-find-many-args";
import { InputJsonValue } from "@/types";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { isRecordNotFoundError } from "@/db/db.util";
import * as errors from "@/errors";
import { Type } from "@sinclair/typebox";
import { EndUserSchema } from "@/common/schemas";

export const endUserControllerInternal: FastifyPluginAsyncTypebox = async (fastify) => {
  const endUserRepository = new EndUserRepository(
    db
  );
  const endUserService = new EndUserService(endUserRepository);

  fastify.get("/",
    {
      schema: {
        description: "Fetch a list of end-users based on query parameters",
        tags: ["Internal", "End-users"],
        querystring: EndUserFindManyArgs,
        response: {
          200: Type.Array(Type.Omit(EndUserSchema, ["endUsersOnBusinesses", "workflowRuntimeData", "businesses"])),
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
      const endUsers = await endUserService.list({
        ...req.query,
        ...query
      });

      return reply.send(endUsers);
    });

  fastify.get("/:id",    {
    schema: {
      description: "Retrieve an EndUser by its unique ID",
      tags: ["Internal", "End-user"],
      params: Type.Object({
        id: Type.String({ description: "Unique ID of the end user" })
      }),
      response: {
        200: Type.Omit(EndUserSchema, ["endUsersOnBusinesses", "workflowRuntimeData", "businesses"]),
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
      const endUser = await endUserService.getById(req.params.id);

      return reply.send(endUser);
    } catch (err) {
      if (isRecordNotFoundError(err)) {
        throw new errors.NotFoundException(`No resource was found for ${JSON.stringify(req.params.id)}`);
      }

      throw err;
    }
  });

};