import { QueryMode } from './query-mode';
import { Type } from '@sinclair/typebox';

import { TypeNullable } from "@/common/schemas";

export const StringNullableFilter = Type.Object({
  equals: Type.Optional(TypeNullable(Type.String())),
  in: Type.Optional(TypeNullable(Type.Array(Type.String()))),
  notIn: Type.Optional(TypeNullable(Type.Array(Type.String()))),
  lt: Type.Optional(Type.String()),
  lte: Type.Optional(Type.String()),
  gt: Type.Optional(Type.String()),
  gte: Type.Optional(Type.String()),
  contains: Type.Optional(Type.String()),
  startsWith: Type.Optional(Type.String()),
  endsWith: Type.Optional(Type.String()),
  mode: Type.Optional(QueryMode),
  not: Type.Optional(Type.String()),
});