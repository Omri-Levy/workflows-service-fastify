import { BadRequestSchema, InternalServerErrorSchema, UnauthorizedSchema } from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";

export const GetContentByIdRouteExternalSchema = {
  params: Type.Object({
    id: Type.String()
  }),
  response: {
    200: {
      type: "string",
      content: "application/octet-stream",
      format: "binary",
      description: "File's content",
    },
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};