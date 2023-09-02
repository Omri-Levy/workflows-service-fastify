import { WorkflowDefinitionCreateSchema } from "@/workflow/dtos/workflow-definition-create";
import { BadRequestSchema, InternalServerErrorSchema, UnauthorizedSchema } from "@/common/schemas/http-schemas";
import { WorkflowDefinitionSchema } from "@/workflow/workflow-definition.schema";
import { Type } from "@sinclair/typebox";

export const CreateWorkflowDefinitionRouteInternalSchema = {
  description: "Creates a workflow definition",
  tags: ["Internal", "Workflows"],
  body: WorkflowDefinitionCreateSchema,
  response: {
    201: Type.Pick(WorkflowDefinitionSchema, [
      "id",
      "name",
      "version",
      "definition",
      "definitionType",
      "backend",
      "extensions",
      "persistStates",
      "submitStates"
    ]),
    400: BadRequestSchema,
    401: UnauthorizedSchema,
    500: InternalServerErrorSchema
  }
};