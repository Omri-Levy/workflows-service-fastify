import { TypeNullable } from "@/common/schemas/schemas";
import { WorkflowRuntimeDataSchema } from "@/workflow/workflow-runtime-data.schema";
import { Type } from "@sinclair/typebox";
import {
  BadRequestSchema,
  InternalServerErrorSchema,
  NotFoundSchema,
  UnauthorizedSchema
} from "@/common/schemas/http-schemas";

export const AssignWorkflowByIdRouteSchemaInternal = {
  description: "Assign a workflow runtime data by its unique ID to a user",
  tags: ["Internal", "Workflows"],
  params: Type.Object({
    id: Type.String({ description: "Unique ID of the workflow" })
  }),
  body: Type.Object({
    assigneeId: TypeNullable(
      Type.String({ description: "ID of the user to assign the workflow to" })
    )
  }, {
    additionalProperties: false
  }),
  response: {
    200: Type.Omit(WorkflowRuntimeDataSchema, ["workflowDefinition"]),
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    404: NotFoundSchema,
    500: InternalServerErrorSchema
  }
};