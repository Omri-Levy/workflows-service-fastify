import { typeboxBuilder } from "@/common/utils/typebox-builder/typebox-builder";
import { WorkflowRuntimeData } from "@prisma/client";
import { TypeDateString, TypeNullable } from "@/common/schemas/schemas";
import { WorkflowRuntimeDataStatusSchema } from "@/workflow/workflow-runtime-data-status.schema";
import { Type } from "@sinclair/typebox";

export const BaseWorkflowRuntimeDataSchema =
  typeboxBuilder<WorkflowRuntimeData>()(
    Type.Object({
      id: Type.String(),
      endUserId: TypeNullable(Type.String()),
      businessId: TypeNullable(Type.String()),
      assigneeId: TypeNullable(Type.String()),
      workflowDefinitionId: Type.String(),
      workflowDefinitionVersion: Type.Number(),
      context: Type.Any(),
      config: Type.Any(),
      state: TypeNullable(Type.String()),
      status: WorkflowRuntimeDataStatusSchema,
      createdAt: TypeDateString,
      updatedAt: TypeDateString,
      createdBy: Type.String({ default: "SYSTEM" }),
      resolvedAt: TypeNullable(
        TypeDateString
      ),
      assignedAt: TypeNullable(
        TypeDateString
      )
    })
  );