import {
  BadRequestSchema,
  InternalServerErrorSchema,
  NotFoundSchema,
  UnauthorizedSchema
} from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";
import { WorkflowDefinitionSchema } from "@/workflow/workflow-definition.schema";
import { WorkflowRuntimeDataSchema } from "@/workflow/workflow-runtime-data.schema";

export const IntentRouteExternalSchema = {
  description: "Retrieve a",
  tags: ["External", "Workflows"],
  body: Type.Object({
    entityId: Type.String({ description: "ID of the business or individual" }),
    intentName: Type.String({ description: "Name of the intent" })
  }, {
    additionalProperties: false
  }),
  response: {
    200: Type.Tuple([
        Type.Object({
          workflowDefinition: Type.Omit(WorkflowDefinitionSchema, ["workflowRuntimeData"]),
          workflowRuntimeData: Type.Omit(WorkflowRuntimeDataSchema, ["workflowDefinition"]),
          ballerineEntityId: Type.String({
            description: "ID of the business or individual"
          })
        })
      ]
    ),
    400: BadRequestSchema,
    404: NotFoundSchema,
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};