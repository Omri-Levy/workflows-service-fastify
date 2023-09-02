import {
  BadRequestSchema,
  InternalServerErrorSchema,
  NotFoundSchema,
  UnauthorizedSchema
} from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";
import { WorkflowDefinitionSchema } from "@/workflow/workflow-definition.schema";

export const GetWorkflowDefinitionByIdRouteExternalSchema = {
  description: "Retrieve a workflow definition by its unique ID",
  tags: ["External", "Workflow"],
  params: Type.Object({
    id: Type.String({ description: "Unique ID of the workflow definition" })
  }),
  response: {
    200: Type.Omit(WorkflowDefinitionSchema, ["workflowRuntimeData"]),
    400: BadRequestSchema,
    404: NotFoundSchema,
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};
