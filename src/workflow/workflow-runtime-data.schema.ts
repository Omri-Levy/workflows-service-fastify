import { Type } from "@sinclair/typebox";
import { WorkflowDefinitionSchema } from "@/workflow/workflow-definition.schema";
import { BaseBusinessSchema } from "@/business/base-business.schema";
import { BaseEndUserSchema } from "@/end-user/base-end-user.schema";
import { BaseWorkflowRuntimeDataSchema } from "@/workflow/base-workflow-runtime-data.schema";
import { BaseUserSchema } from "@/user/base-user.schema";

export const WorkflowRuntimeDataSchema = Type.Composite(
  [
    BaseWorkflowRuntimeDataSchema,
    Type.Object({
      endUser: Type.Optional(BaseEndUserSchema),
      business: Type.Optional(BaseBusinessSchema),
      assignee: Type.Optional(BaseUserSchema),
      workflowDefinition: WorkflowDefinitionSchema
    })
  ]
);