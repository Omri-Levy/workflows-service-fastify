import { EndUserFindManyArgs } from "@/end-user/dtos/end-user-find-many-args";
import { BadRequestSchema, InternalServerErrorSchema, UnauthorizedSchema } from "@/common/schemas/http-schemas";
import { EndUserSchema } from "@/end-user/end-user.schema";
import { Type } from "@sinclair/typebox";

export const ListEndUsersRouteInternalSchema = {
  description: "Fetch a list of end-users based on query parameters",
  tags: ["Internal", "End-users"],
  querystring: EndUserFindManyArgs,
  response: {
    200: Type.Array(Type.Omit(EndUserSchema, ["endUsersOnBusinesses", "workflowRuntimeData", "businesses"])),
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};