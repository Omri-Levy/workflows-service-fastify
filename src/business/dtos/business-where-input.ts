import { DateTimeFilter } from "@/common/query-filters/date-time-filter";
import { StringFilter } from "@/common/query-filters/string-filter";
import { StringNullableFilter } from "@/common/query-filters/string-nullable-filter";
import { Type } from "@sinclair/typebox";

import { ApprovalStateSchema } from "@/common/enums";

export const BusinessWhereInput = Type.Object({
  correlationId: StringFilter,
  verificationId: Type.Optional(StringNullableFilter),
  businessType: Type.Optional(StringNullableFilter),
  approvalState: Type.Optional(ApprovalStateSchema),
  stateReason: Type.Optional(StringNullableFilter),
  firstName: Type.Optional(StringNullableFilter),
  lastName: Type.Optional(StringNullableFilter),
  email: Type.Optional(StringNullableFilter),
  phone: Type.Optional(StringNullableFilter),
  createdAt: Type.Optional(DateTimeFilter),
  updatedAt: Type.Optional(DateTimeFilter)
});