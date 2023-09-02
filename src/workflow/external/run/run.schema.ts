import {
  BadRequestSchema,
  InternalServerErrorSchema,
  NotFoundSchema,
  UnauthorizedSchema
} from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";
import { WorkflowRuntimeDataSchema } from "@/workflow/workflow-runtime-data.schema";

export const RunRouteExternalSchema = {
  description: "Creates or updates an entity and a workflow runtime data",
  tags: ["External", "Workflows"],
  body: Type.Composite([
    Type.Object({
      workflowId: Type.String({ description: "ID of the workflow" })
    }),
    Type.Pick(WorkflowRuntimeDataSchema, ["context", "config"])
  ], {
    additionalProperties: false
  }),
  response: {
    200: Type.Object({
      workflowDefinitionId: Type.String(),
      workflowRuntimeId: Type.String(),
      ballerineEntityId: Type.String({
        description: "ID of the business or individual"
      })
    }),
    400: BadRequestSchema,
    404: NotFoundSchema,
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};