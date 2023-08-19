import { DateTimeFilter } from '@/common/query-filters/date-time-filter';
import { StringNullableFilter } from '@/common/query-filters/string-nullable-filter';
import { Type } from '@sinclair/typebox';
import { StringFilter } from '@/common/query-filters/string-filter';
import { ApprovalState } from "@/common/enums";

export const EndUserWhereInput = Type.Object({
  correlationId: Type.Optional(StringFilter),
  verificationId: Type.Optional(StringNullableFilter),
  endUserType: Type.Optional(StringNullableFilter),
  approvalState: Type.Optional(Type.Enum(ApprovalState)),
  stateReason: Type.Optional(StringNullableFilter),
  firstName: Type.String(),
  lastName: Type.String(),
  email: Type.Optional(StringNullableFilter),
  phone: Type.Optional(StringNullableFilter),
  createdAt: Type.Optional(DateTimeFilter),
  updatedAt: Type.Optional(DateTimeFilter),
});