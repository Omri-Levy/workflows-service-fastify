import { Static, Type } from "@sinclair/typebox";
import { WorkflowRuntimeDataSchema } from "@/workflow/workflow-runtime-data.schema";

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