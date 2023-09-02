import { BadRequestSchema, InternalServerErrorSchema, UnauthorizedSchema } from "@/common/schemas/http-schemas";
import { BusinessSchema } from "@/business/business.schema";
import { BusinessFindManyArgs } from "@/business/dtos/business-find-many-args";
import { Type } from "@sinclair/typebox";

export const ListBusinessesRouteInternalSchema = {
  description: "Fetch a list of businesses based on query parameters",
  tags: ["Internal", "Businesses"],
  querystring: BusinessFindManyArgs,
  response: {
    200: Type.Array(Type.Omit(BusinessSchema, ["endUsersOnBusinesses", "workflowRuntimeData", "endUsers"])),
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};