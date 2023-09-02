import { FilterSchema } from "@/filter/filter.schema";
import {
  BadRequestSchema,
  InternalServerErrorSchema,
  NotFoundSchema,
  UnauthorizedSchema
} from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";

export const GetFilterByIdRouteInternalSchema = {
  description: "Retrieve a filter by its unique ID",
  tags: ["Internal", "Filter"],
  params: Type.Object({
    id: Type.String({ description: "Unique ID of the filter" })
  }),
  response: {
    200: FilterSchema,
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    404: NotFoundSchema,
    500: InternalServerErrorSchema
  }
};