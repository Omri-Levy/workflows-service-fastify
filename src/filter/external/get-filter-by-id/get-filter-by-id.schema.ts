import { FilterSchema } from "@/filter/filter.schema";
import { BadRequestSchema, InternalServerErrorSchema, UnauthorizedSchema } from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";

export const GetFilterByIdRouteExternalSchema = {
  description: "Retrieve a filter by its unique ID",
  tags: ["External", "Filter"],
  params: Type.Object({
    id: Type.String({ description: "Unique ID of the filter" })
  }),
  response: {
    200: FilterSchema,
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    404: Type.Object({
      status: Type.String(),
      message: Type.String()
    }),
    500: InternalServerErrorSchema
  }
};