import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { ListUsersRouteInternalSchema } from "@/user/internal/list-users/list-users.schema";
import { PasswordService } from "@/auth/password/password.service";
import { UserRepository } from "@/user/user.repository";
import { db } from "@/db/client";
import { UserService } from "@/user/user.service";

export const listUsersRouteInternal: FastifyPluginAsyncTypebox = async (app) => {

  const passwordService = new PasswordService();
  const userRepository = new UserRepository(
    db,
    passwordService
  );
  const userService = new UserService(userRepository);

  app.route({
    method: "GET",
    url: "/",
    schema: ListUsersRouteInternalSchema,
    handler: async (_req, reply) => {
      const users = await userService.list({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          updatedAt: true,
          createdAt: true
        }
      });

      return reply.send(users);
    }
  });
};