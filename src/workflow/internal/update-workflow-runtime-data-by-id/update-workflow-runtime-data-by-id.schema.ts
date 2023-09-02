import { WorkflowRuntimeDataUpdateSchema } from "@/workflow/dtos/workflow-runtime-data-update";
import { WorkflowRuntimeDataSchema } from "@/workflow/workflow-runtime-data.schema";
import { BadRequestSchema, InternalServerErrorSchema, UnauthorizedSchema } from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";

export const UpdateWorkflowRuntimeDataRouteInternalSchema = {
  description: "Update a workflow runtime data by its unique ID",
  tags: ["Internal", "Workflow"],
  params: Type.Object({
    id: Type.String({ description: "ID of the workflow runtime data" })
  }),
  body: WorkflowRuntimeDataUpdateSchema,
  response: {
    200: Type.Omit(WorkflowRuntimeDataSchema, ["workflowDefinition"]),
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};