import { WorkflowRuntimeDataSchema } from "@/workflow/workflow-runtime-data.schema";
import { Type } from "@sinclair/typebox";
import { BaseBusinessSchema } from "@/business/base-business.schema";
import { BaseEndUsersOnBusinessesSchema } from "@/common/schemas/base-end-users-on-businesses.schema";
import { BaseEndUserSchema } from "@/end-user/base-end-user.schema";

export const EndUserSchema = Type.Composite(
  [
    BaseEndUserSchema,
    Type.Object({
      workflowRuntimeData: Type.Array(WorkflowRuntimeDataSchema),
      businesses: Type.Array(BaseBusinessSchema),
      endUsersOnBusinesses: Type.Array(BaseEndUsersOnBusinessesSchema)
    })
  ]
);