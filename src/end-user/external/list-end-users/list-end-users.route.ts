import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { ListEndUsersRouteExternalSchema } from "@/end-user/external/list-end-users/list-end-users.schema";
import { EndUserRepository } from "@/end-user/end-user.repository";
import { db } from "@/db/client";
import { EndUserService } from "@/end-user/end-user.service";

export const listEndUsersRouteExternal: FastifyPluginAsyncTypebox = async (app) => {

  const endUserRepository = new EndUserRepository(
    db
  );
  const endUserService = new EndUserService(endUserRepository);

  app.route({
    method: "GET",
    url: "/",
    schema: ListEndUsersRouteExternalSchema,
    handler: async (req, reply) => {
      const endUsers = await endUserService.list(req.query);

      return reply.send(endUsers);
    }
  });
};