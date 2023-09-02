import { FilterSchema } from "@/filter/filter.schema";
import { BadRequestSchema, InternalServerErrorSchema, UnauthorizedSchema } from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";

export const CreateFilterRouteExternalSchema = {
  description: "Create a new filter",
  tags: ["External", "Filters"],
  body: Type.Object({
    name: Type.String(),
    entity: Type.Union([Type.Literal("individuals"), Type.Literal("businesses")]),
    query: FilterSchema.properties.query
  }, {
    additionalProperties: false
  }),
  response: {
    201: FilterSchema,
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};