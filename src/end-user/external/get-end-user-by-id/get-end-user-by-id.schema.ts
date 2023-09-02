import {
  BadRequestSchema,
  InternalServerErrorSchema,
  NotFoundSchema,
  UnauthorizedSchema
} from "@/common/schemas/http-schemas";
import { EndUserSchema } from "@/end-user/end-user.schema";
import { Type } from "@sinclair/typebox";

export const GetEndUserByIdRouteExternalSchema = {
  description: "Retrieve an end-user by its unique ID",
  tags: ["External", "End-user"],
  params: Type.Object({
    id: Type.String({ description: "Unique ID of the end user" })
  }),
  response: {
    200: Type.Omit(EndUserSchema, ["endUsersOnBusinesses", "workflowRuntimeData", "businesses"]),
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    404: NotFoundSchema,
    500: InternalServerErrorSchema
  }
};