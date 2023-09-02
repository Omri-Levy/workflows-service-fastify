import {
  BadRequestSchema,
  InternalServerErrorSchema,
  NotFoundSchema,
  UnauthorizedSchema
} from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";
import { WorkflowDefinitionSchema } from "@/workflow/workflow-definition.schema";
import { WorkflowRuntimeDataSchema } from "@/workflow/workflow-runtime-data.schema";

export const ListEndUserWorkflowsRouteExternalSchema = {
  description: "Fetch a list of workflows associated with a specific end-user",
  tags: ["External", "Workflows"],
  params: Type.Object({
    endUserId: Type.String({ description: "ID of the end-user" })
  }),
  response: {
    200: Type.Array(
      Type.Object({
        workflowDefinition: Type.Omit(WorkflowDefinitionSchema, ["workflowRuntimeData"]),
        workflowRuntimeData: Type.Omit(WorkflowRuntimeDataSchema, ["workflowDefinition"])
      })
    ),
    400: BadRequestSchema,
    404: NotFoundSchema,
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};