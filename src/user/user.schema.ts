import { WorkflowRuntimeDataSchema } from "@/workflow/workflow-runtime-data.schema";
import { Type } from "@sinclair/typebox";
import { BaseUserSchema } from "@/user/base-user.schema";

export const UserSchema = Type.Composite([
  BaseUserSchema,
  Type.Object({
    workflowRuntimeData: Type.Array(Type.Omit(WorkflowRuntimeDataSchema, ["workflowDefinition"]))
  })
]);