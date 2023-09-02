import {
  BadRequestSchema,
  InternalServerErrorSchema,
  NotFoundSchema,
  UnauthorizedSchema
} from "@/common/schemas/http-schemas";
import { WorkflowDefinitionSchema } from "@/workflow/workflow-definition.schema";
import { WorkflowRuntimeDataSchema } from "@/workflow/workflow-runtime-data.schema";
import { Type } from "@sinclair/typebox";

export const ListWorkflowsByBusinessIdRouteExternalSchema = {
  description: "Fetch a list of workflows associated with a specific business",
  tags: ["External", "Workflows"],
  params: Type.Object({
    businessId: Type.String({ description: "ID of the business" })
  }),
  response: {
    200: Type.Array(
      Type.Object({
        workflowDefinition: Type.Omit(WorkflowDefinitionSchema, ["workflowRuntimeData"]),
        workflowRuntimeData: Type.Omit(WorkflowRuntimeDataSchema, ["workflowDefinition"])
      })
    ),
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    404: NotFoundSchema,
    500: InternalServerErrorSchema
  }
};