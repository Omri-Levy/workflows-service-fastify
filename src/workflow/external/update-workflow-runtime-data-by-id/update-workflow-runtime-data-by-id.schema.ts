import { WorkflowRuntimeDataSchema } from "@/workflow/workflow-runtime-data.schema";
import { TypeNoNull } from "@/common/schemas/schemas";
import {
  BadRequestSchema,
  InternalServerErrorSchema,
  NotFoundSchema,
  UnauthorizedSchema
} from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";

export const UpdateWorkflowRuntimeDataByIdRouteExternalSchema = {
  description: "Update a workflow runtime data by its unique ID",
  tags: ["External", "Workflow"],
  params: Type.Object({
    id: Type.String({ description: "ID of the workflow runtime data" })
  }),
  body: Type.Partial(
    Type.Object({
      status: WorkflowRuntimeDataSchema.properties.status,
      context: WorkflowRuntimeDataSchema.properties.context,
      resolvedAt: WorkflowRuntimeDataSchema.properties.resolvedAt,
      state: TypeNoNull(WorkflowRuntimeDataSchema.properties.state),
      assigneeId: TypeNoNull(WorkflowRuntimeDataSchema.properties.assigneeId)
    }),
    {
      additionalProperties: false
    }
  ),
  response: {
    200: Type.Omit(WorkflowRuntimeDataSchema, ["workflowDefinition"]),
    400: BadRequestSchema,
    404: NotFoundSchema,
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};