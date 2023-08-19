import { StringNullableFilter } from '@/common/query-filters/string-nullable-filter';
import { Type } from '@sinclair/typebox';
import { StringFilter } from '@/common/query-filters/string-filter';
import { UserWhereUniqueInput } from '@/user/dtos/user-where-unique-input';
import { DateTimeFilter } from '@/common/query-filters/date-time-filter';

export const WorkflowDefinitionWhereInput = Type.Object({
  user: Type.Optional(UserWhereUniqueInput),
  id: Type.Optional(StringFilter),
  name: Type.Optional(StringFilter),
  workflowDefinitionType: Type.Optional(StringNullableFilter),
  state: Type.Optional(StringNullableFilter),
  createdAt: Type.Optional(DateTimeFilter),
  updatedAt: Type.Optional(DateTimeFilter)
});