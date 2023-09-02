import { UserSchema } from "@/user/user.schema";
import { InternalServerErrorSchema, UnauthorizedSchema } from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";

export const ListUsersRouteInternalSchema = {
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
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};