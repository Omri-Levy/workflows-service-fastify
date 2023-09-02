import { Type } from "@sinclair/typebox";

export const WorkflowRuntimeDataStatusSchema = Type.Union([
  Type.Literal("active"),
  Type.Literal("completed"),
  Type.Literal("failed")
]);