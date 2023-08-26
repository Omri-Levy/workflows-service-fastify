import { Type } from "@sinclair/typebox";
import { WorkflowDefinitionSchema } from "@/common/schemas";

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