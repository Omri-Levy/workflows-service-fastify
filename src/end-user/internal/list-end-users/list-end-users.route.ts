import { ListEndUsersRouteInternalSchema } from "@/end-user/internal/list-end-users/list-end-users.schema";
import { InputJsonValue } from "@/types";
import { EndUserRepository } from "@/end-user/end-user.repository";
import { db } from "@/db/client";
import { EndUserService } from "@/end-user/end-user.service";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

export const listEndUsersRouteInternal: FastifyPluginAsyncTypebox = async (app) => {

  const endUserRepository = new EndUserRepository(
    db
  );
  const endUserService = new EndUserService(endUserRepository);

  app.route({
    method: "GET",
    url: "/",
    schema: ListEndUsersRouteInternalSchema,
    handler: async (req, reply) => {

      const query: InputJsonValue = {};
      const endUsers = await endUserService.list({
        ...req.query,
        ...query
      });

      return reply.send(endUsers);
    }
  });
};