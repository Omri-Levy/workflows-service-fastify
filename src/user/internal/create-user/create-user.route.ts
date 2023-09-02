import { CreateUserRouteInternalSchema } from "@/user/internal/create-user/create-user.schema";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { isUniqueConstraintError } from "@/db/db.util";
import { PasswordService } from "@/auth/password/password.service";
import { UserRepository } from "@/user/user.repository";
import { db } from "@/db/client";
import { UserService } from "@/user/user.service";
import { BadRequestError } from "@/common/errors/bad-request-error";

export const createUserRouteInternal: FastifyPluginAsyncTypebox = async (app) => {

  const passwordService = new PasswordService();
  const userRepository = new UserRepository(
    db,
    passwordService
  );
  const userService = new UserService(userRepository);

  app.route({
    method: "POST",
    url: "/",
    schema: CreateUserRouteInternalSchema,
    handler: async (req, reply) => {
      try {
        const user = await userService.create({
          data: req.body,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            roles: true,
            workflowRuntimeData: true
          }
        });

        return reply.status(201).send(user);
      } catch (err) {
        if (!isUniqueConstraintError(err)) {
          throw err;
        }

        const message = (() => {
          if (err.meta.target.includes("email")) {
            return "Email already in use";
          }

          if (err.meta.target.includes("phone")) {
            return "Phone already in use";
          }

          throw err;
        })();

        throw new BadRequestError(message);
      }
    }
  });
};
