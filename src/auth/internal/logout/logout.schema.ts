import { BadRequestSchema, InternalServerErrorSchema } from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";

export const LogoutRouteInternalSchema = {
  description: "Log out a user",
  tags: ["Authentication"],
  response: {
    200: Type.Object({
      user: Type.Null()
    }),
    400: BadRequestSchema,
    500: InternalServerErrorSchema
  }
};