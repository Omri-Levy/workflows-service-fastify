import { UserSchema } from "@/user/user.schema";
import { BadRequestSchema, InternalServerErrorSchema, UnauthorizedSchema } from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";

export const LoginRouteInternalSchema = {
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
    401: UnauthorizedSchema,
    400: BadRequestSchema,
    500: InternalServerErrorSchema
  }
};