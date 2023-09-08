import { Type } from "@sinclair/typebox";
import { BadRequestSchema, InternalServerErrorSchema, UnauthorizedSchema } from "@/common/schemas/http-schemas";

export const AuthorizeUserRouteSchema = {
  body: Type.Object({
    email: Type.String({
      format: "email",
    }),
    flowType: Type.String({
      minLength: 1,
    })
  }),
  response: {
    200: Type.Object({}),
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema,
  }
};