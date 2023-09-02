import { FilterFindManyArgs } from "@/filter/dtos/filter-find-many-args";
import { BadRequestSchema, InternalServerErrorSchema, UnauthorizedSchema } from "@/common/schemas/http-schemas";
import { FilterSchema } from "@/filter/filter.schema";
import { Type } from "@sinclair/typebox";

export const ListFiltersRouteExternalSchema = {
  description: "Fetch a list of filters based on query parameters",
  tags: ["External", "Filters"],
  querystring: FilterFindManyArgs,
  response: {
    200: Type.Array(FilterSchema),
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    404: Type.Object({
      status: Type.String(),
      message: Type.String()
    }),
    500: InternalServerErrorSchema
  }
};