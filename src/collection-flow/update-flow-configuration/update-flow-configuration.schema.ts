import { BadRequestSchema, InternalServerErrorSchema, UnauthorizedSchema } from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";

export const UpdateFlowConfigurationRouteSchema = {
  params: Type.Object({
    configurationId: Type.String(),
  }),
  body: Type.Object({
    steps: Type.Array(
      Type.Object({
      key: Type.String(),
      title: Type.Optional(Type.String()),
      description: Type.Optional(Type.String()),
      uiSchema: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
      formSchema: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
      defaultData: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
      isFinal: Type.Boolean()
    })
    ),
  }),
  response: {
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};