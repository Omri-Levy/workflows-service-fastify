import { BadRequestSchema, InternalServerErrorSchema, UnauthorizedSchema } from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";
import { EndUserSchema } from "@/end-user/end-user.schema";

export const CreateEndUserRouteExternalSchema = {
  description: "Create a new end-user",
  tags: ["External", "End-users"],
  body: Type.Object({
    firstName: Type.String(),
    lastName: Type.String(),
  }, {
    additionalProperties: false
  }),
  response: {
    201: Type.Pick(EndUserSchema, ["id", "firstName", "lastName", "avatarUrl"]),
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};