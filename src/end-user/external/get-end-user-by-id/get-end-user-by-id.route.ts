import { isRecordNotFoundError } from "@/db/db.util";
import { GetEndUserByIdRouteExternalSchema } from "@/end-user/external/get-end-user-by-id/get-end-user-by-id.schema";
import { NotFoundError } from "@/common/errors/not-found-error";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { EndUserRepository } from "@/end-user/end-user.repository";
import { db } from "@/db/client";
import { EndUserService } from "@/end-user/end-user.service";

export const getEndUserByIdRouteExternal: FastifyPluginAsyncTypebox = async (app) => {

  const endUserRepository = new EndUserRepository(
    db
  );
  const endUserService = new EndUserService(endUserRepository);

  app.route({
    method: "GET",
    url: "/:id",
    schema: GetEndUserByIdRouteExternalSchema,
    handler: async (req, reply) => {
      try {
        const endUser = await endUserService.getById(req.params.id);
        return reply.send(endUser);
      } catch (err) {
        if (isRecordNotFoundError(err)) {
          throw new NotFoundError(`No resource was found for ${JSON.stringify(req.params.id)}`);
        }
        throw err;
      }
    }
  });
};