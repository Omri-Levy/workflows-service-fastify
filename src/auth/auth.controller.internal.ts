import { Type } from "@sinclair/typebox";
import { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { TypeNullable, UserSchema } from "@/common/schemas";
import fastifyPassport from "@fastify/passport";

export const authControllerInternal: FastifyPluginAsyncTypebox = async (fastify) => {

  fastify.post("/login", {
    schema: {
      description: "Log in a user",
      tags: ["Authentication"],
      body: Type.Object({
        email: Type.String(),
        password: Type.String(),
        callbackUrl: Type.Optional(Type.String())
      }, {
        additionalProperties: false
      }),
      response: {
        200: Type.Object({
          user: Type.Pick(UserSchema, [
            "id",
            "firstName",
            "lastName",
            "email"
          ])
        }),
        401: Type.Object({
          status: Type.String(),
          message: Type.String()
        }),
        400: Type.Object({
          status: Type.String(),
          message: Type.String()
        }),
        500: Type.Object({
          status: Type.Optional(Type.String()),
          code: Type.Optional(Type.Number()),
          message: Type.String()
        })
      }
    },
    preValidation: fastifyPassport.authenticate("local")
  }, async (req, reply) => {

    return reply.send({
      user: req?.user
    });
  });

  fastify.post("/logout", {
    schema: {
      description: "Log out a user",
      tags: ["Authentication"],
      response: {
        200: Type.Object({
          user: Type.Null()
        }),
        400: Type.Object({
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

    void req.logOut();

    void reply.clearCookie("session", { path: "/", httpOnly: true });
    void reply.clearCookie("session.sig", { path: "/", httpOnly: true });

    return reply.send({ user: null });
  });

  fastify.get("/session",
    {
      schema: {
        description: "Get the data of the authenticated user",
        tags: ["Authentication"],
        response: {
          200: Type.Object({
            user: TypeNullable(
              Type.Pick(UserSchema, [
                "id",
                "firstName",
                "lastName",
                "email"
              ]))
          }),
          400: Type.Object({
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

      return reply.send({
        user: req?.user ?? null
      });
    });

};