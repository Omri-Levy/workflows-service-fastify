import { UserSchema } from "@/user/user.schema";
import { BadRequestSchema, InternalServerErrorSchema, UnauthorizedSchema } from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";

export const CreateUserRouteInternalSchema = {
  description: "Create a new user",
  tags: ["Internal", "Users"],
  body: Type.Object({
    email: Type.String(),
    firstName: Type.String(),
    lastName: Type.String(),
    password: Type.String(),
    roles: Type.Array(Type.String())
  }, {
    additionalProperties: false
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
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};