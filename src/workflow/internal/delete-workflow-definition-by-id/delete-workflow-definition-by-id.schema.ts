import { WorkflowDefinitionSchema } from "@/workflow/workflow-definition.schema";
import { BadRequestSchema, InternalServerErrorSchema, UnauthorizedSchema } from "@/common/schemas/http-schemas";
import { Type } from "@sinclair/typebox";

export const DeleteWorkflowDefinitionRouteInternalSchema = {
  description: "Delete a workflow definition by its unique ID",
  tags: ["Internal", "Workflows"],
  params: Type.Object({
    id: Type.String({ description: "ID of the workflow" })
  }),
  response: {
    200: Type.Pick(
      WorkflowDefinitionSchema,
      [
        "id",
        "name",
        "version",
        "definition",
        "definitionType",
        "backend",
        "extensions",
        "persistStates",
        "submitStates"
      ]
    ),
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};