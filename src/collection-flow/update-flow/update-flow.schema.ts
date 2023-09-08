import { BadRequestSchema, InternalServerErrorSchema, UnauthorizedSchema } from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";
import { TypeDateString } from "@/common/schemas/schemas";

export const UpdateFlowRouteSchema = {
  params: Type.Object({
    flowId: Type.String(),
  }),
  body: Type.Object({
    flowType: Type.String(),
    payload: Type.Object({
      mainRepresentative: Type.Optional(
        Type.Object({
          firstName: Type.String(),
          lastName: Type.String(),
          phone: Type.String(),
          dateOfBirth: TypeDateString,
          companyName: Type.String(),
          email: Type.String({
            format: 'email'
          }),
          title: Type.String()
        })
      ),
      documents: Type.Array(
        Type.Object({
          id: Type.Optional(Type.String()),
          fileId: Type.Optional(Type.String({
            minLength: 1
          })),
          properties: Type.Record(
            Type.String(),
            Type.Unknown()
          ),
          category: Type.String({
            minLength: 1
          }),
          type: Type.String({
            minLength: 1
          }),
          uri: Type.Optional(Type.String()),
          decision: Type.Optional(Type.Record(
            Type.String(),
            Type.Unknown()
          ))
        })
      ),
      ubos: Type.Array(
        Type.Object({
          id: Type.String({
            minLength: 1
          }),
          firstName: Type.String(),
          lastName: Type.String(),
          title: Type.String(),
          birthDate: Type.String(),
          email: Type.String({
            format: 'email'
          })
        })
      ),
      dynamicData: Type.Record(
        Type.String(),
        Type.Unknown()
      ),
      flowState: Type.Optional(Type.Union([Type.String(), Type.Null()])),
      businessData: Type.Record(
        Type.String(),
        Type.Unknown()
      )
    })
  }),
  response: {
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};