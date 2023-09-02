import { WorkflowRuntimeDataSchema } from "@/workflow/workflow-runtime-data.schema";
import { BadRequestSchema, InternalServerErrorSchema, UnauthorizedSchema } from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";

export const ListActiveStatesRouteInternalSchema = {
  description: "Fetches a list of workflow runtime data",
  tags: ["Internal", "Workflows"],
  response: {
    200: Type.Array(
      Type.Pick(
        WorkflowRuntimeDataSchema,
        [
          "id",
          "state",
          "status",
          "endUserId",
          "businessId",
          "assigneeId",
          "workflowDefinitionId"
        ]
      )
    ),
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};