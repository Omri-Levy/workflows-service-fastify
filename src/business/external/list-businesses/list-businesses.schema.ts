import { BadRequestSchema, InternalServerErrorSchema, UnauthorizedSchema } from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";
import { BusinessFindManyArgs } from "@/business/dtos/business-find-many-args";
import { BusinessSchema } from "@/business/business.schema";

export const ListBusinessesRouteExternalSchema = {
  description: "Fetch a list of businesses based on query parameters",
  tags: ["External", "Businesses"],
  querystring: BusinessFindManyArgs,
  response: {
    200: Type.Array(Type.Omit(BusinessSchema, ["endUsersOnBusinesses", "workflowRuntimeData", "endUsers"])),
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};