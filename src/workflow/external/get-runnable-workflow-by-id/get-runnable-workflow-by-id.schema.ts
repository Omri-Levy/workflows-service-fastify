import {
  BadRequestSchema,
  InternalServerErrorSchema,
  NotFoundSchema,
  UnauthorizedSchema
} from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";
import { WorkflowDefinitionSchema } from "@/workflow/workflow-definition.schema";
import { WorkflowRuntimeDataSchema } from "@/workflow/workflow-runtime-data.schema";

export const GetRunnableWorkflowByIdRouteExternalSchema = {
  description: "Retrieve a workflow runtime data and its workflow definition by the workflow runtime data's unique ID",
  tags: ["External", "Workflow"],
  params: Type.Object({
    id: Type.String({ description: "Unique ID of the workflow runtime data" })
  }),
  response: {
    200: Type.Object({
      workflowDefinition: Type.Omit(WorkflowDefinitionSchema, ["workflowRuntimeData"]),
      workflowRuntimeData: Type.Omit(WorkflowRuntimeDataSchema, ["workflowDefinition"])
    }),
    400: BadRequestSchema,
    404: NotFoundSchema,
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};