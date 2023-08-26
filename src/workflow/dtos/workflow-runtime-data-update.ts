import { WorkflowRuntimeDataSchema } from "@/common/schemas";
import { Static, Type } from "@sinclair/typebox";

export const WorkflowRuntimeDataUpdateSchema = Type.Partial(
  Type.Pick(WorkflowRuntimeDataSchema, [
    "state",
    "context",
    "status",
    "resolvedAt",
    "assigneeId"
  ]),
  {
    additionalProperties: false
  }
);

export type TWorkflowRuntimeDataUpdate = Static<typeof WorkflowRuntimeDataUpdateSchema>;