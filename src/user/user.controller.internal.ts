import { UserService } from "./user.service";
import { db } from "@/db/client";
import { UserSchema } from "@/common/schemas";
import { FastifyPluginAsyncTypebox, Type } from "@fastify/type-provider-typebox";
import { UserRepository } from "@/user/user.repository";
import { PasswordService } from "@/auth/password/password.service";
import { isUniqueConstraintError } from "@/db/db.util";
import {
  getReasonPhrase,
  StatusCodes,
} from 'http-status-codes';

export const userControllerInternal: FastifyPluginAsyncTypebox = async (fastify) => {
  const passwordService = new PasswordService();
  const userRepository = new UserRepository(
    db,
    passwordService
  );
  const userService = new UserService(userRepository);

  fastify.post("/", {
      schema: {
        description: "Create a new user",
        tags: ["Internal", "Users"],
        body: Type.Object({
          email: Type.String(),
          firstName: Type.String(),
          lastName: Type.String(),
          password: Type.String(),
          roles: Type.Array(Type.String())
        }),
        response: {
          201: Type.Pick(UserSchema, [
            "id",
            "firstName",
            "lastName",
            "email",
            "phone",
            "roles",
            "workflowRuntimeData"
          ]),
          400: Type.Object({
            status: Type.Optional(Type.String()),
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
    },
    async (req, reply) => {
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

        return reply.status(StatusCodes.BAD_REQUEST).send({
          status: getReasonPhrase(StatusCodes.BAD_REQUEST),
          message
        });
      }
    }
  );


  fastify.get("/",
    {
      schema: {
        description: "Fetch a list of users",
        tags: ["Internal", "Users"],
        response: {
          200: Type.Array(Type.Pick(UserSchema, [
            "id",
            "firstName",
            "lastName",
            "email",
            "phone",
            "updatedAt",
            "createdAt"
          ])),
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
    }, async (_req, reply) => {
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
    });

};