import { TypeNullable } from "@/common/schemas/schemas";
import { UserSchema } from "@/user/user.schema";
import { BadRequestSchema, InternalServerErrorSchema } from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";

export const SessionRouteInternalSchema = {
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
    400: BadRequestSchema,
    500: InternalServerErrorSchema
  }
};