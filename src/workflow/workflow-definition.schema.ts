import { TypeDateString, TypeNullable } from "@/common/schemas/schemas";
import { Type } from "@sinclair/typebox";
import { BaseWorkflowRuntimeDataSchema } from "@/workflow/base-workflow-runtime-data.schema";

export const WorkflowDefinitionSchema = Type.Object({
  id: Type.String(),
  reviewMachineId: Type.Optional(
    TypeNullable(Type.String())
  ),
  name: Type.String(),
  version: Type.Number({ default: 1 }),
  definitionType: Type.String(),
  definition: Type.Any(),
  contextSchema: Type.Optional(Type.Any()),
  config: Type.Optional(Type.Any()),
  supportedPlatforms: Type.Optional(Type.Any()),
  extensions: Type.Optional(Type.Any()),
  backend: Type.Optional(Type.Any()),
  persistStates: Type.Optional(Type.Any()),
  submitStates: Type.Optional(Type.Any()),
  createdAt: TypeDateString,
  updatedAt: TypeDateString,
  createdBy: Type.String({ default: "SYSTEM" }),
  workflowRuntimeData: Type.Array(
    BaseWorkflowRuntimeDataSchema
  )
});