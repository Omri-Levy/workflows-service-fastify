import { BadRequestSchema, InternalServerErrorSchema, UnauthorizedSchema } from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";

export const GetContentByIdRouteInternalSchema = {
  params: Type.Object({
    id: Type.String()
  }),
  response: {
    200: {
      description: "File's content",
      type: 'string',
      contentEncoding: 'binary'
    },
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};