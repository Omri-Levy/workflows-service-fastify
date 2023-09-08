import { BadRequestSchema, InternalServerErrorSchema, UnauthorizedSchema } from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";

export const GetFlowConfigurationRouteSchema = {
  querystring: Type.Object({
    flowType: Type.String({
      minLength: 1,
    })
  }),
  response: {
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};