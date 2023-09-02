import { BadRequestSchema, InternalServerErrorSchema, UnauthorizedSchema } from "@/common/schemas/http-schemas";
import { EndUserSchema } from "@/end-user/end-user.schema";
import { Type } from "@sinclair/typebox";

export const GetEndUserByIdRouteInternalSchema = {
  description: "Retrieve an EndUser by its unique ID",
  tags: ["Internal", "End-user"],
  params: Type.Object({
    id: Type.String({ description: "Unique ID of the end user" })
  }),
  response: {
    200: Type.Omit(EndUserSchema, ["endUsersOnBusinesses", "workflowRuntimeData", "businesses"]),
    400: BadRequestSchema,
    404: Type.Object({
      status: Type.String(),
      message: Type.String()
    }),
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};