import { Type } from "@sinclair/typebox";
import { WorkflowRuntimeDataSchema } from "@/workflow/workflow-runtime-data.schema";
import { EndUserSchema } from "@/end-user/end-user.schema";
import { BaseBusinessSchema } from "@/business/base-business.schema";
import { BaseEndUsersOnBusinessesSchema } from "@/common/schemas/base-end-users-on-businesses.schema";

export const BusinessSchema = Type.Composite(
  [
    BaseBusinessSchema,
    Type.Object({
      workflowRuntimeData: Type.Array(WorkflowRuntimeDataSchema),
      endUsers: Type.Array(EndUserSchema),
      endUsersOnBusinesses: Type.Array(BaseEndUsersOnBusinessesSchema)
    })
  ]
);