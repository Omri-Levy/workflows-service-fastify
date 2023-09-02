import { TypeNullable } from "@/common/schemas/schemas";
import { BadRequestSchema, InternalServerErrorSchema, UnauthorizedSchema } from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";

export const GetRunnableWorkflowByIdRouteInternalSchema = {
  description: "Retrieve a workflow by its unique ID",
  tags: ["Internal", "Workflow"],
  querystring: Type.Object({
    filterId: Type.String({ description: "Unique ID of a filter" })
  }),
  params: Type.Object({
    id: Type.String({ description: "Unique ID of a workflow" })
  }),
  response: {
    200: Type.Object({
      entity: Type.Object({
        id: Type.String(),
        name: Type.String(),
        avatarUrl: Type.Optional(
          TypeNullable(
            Type.String()
          )
        )
      }),
      assignee: Type.Optional(
        TypeNullable(
          Type.Object({
            id: Type.String(),
            firstName: Type.String(),
            lastName: Type.String()
          }))
      ),
      nextEvents: Type.Array(Type.String())
    }, {
      additionalProperties: true,
      description: "Response data may include other properties from workflowRuntimeData, or workflowDefinition depending on passed filter"
    }),
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};