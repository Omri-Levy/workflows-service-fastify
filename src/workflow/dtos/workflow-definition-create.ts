import { Type } from "@sinclair/typebox";

import { WorkflowDefinitionSchema } from "@/workflow/workflow-definition.schema";

export const WorkflowDefinitionCreateSchema = Type.Pick(WorkflowDefinitionSchema, [
  "name",
  "reviewMachineId",
  "definitionType",
  "definition",
  "extensions",
  "backend",
  "persistStates",
  "submitStates"
], {
  additionalProperties: false
});