import { Type } from '@sinclair/typebox';
import { QueryMode } from "@/common/query-filters/query-mode";

export const StringFilter = Type.Object({
  equals: Type.Optional(Type.String()),
  in: Type.Optional(Type.Array(Type.String())),
  notIn: Type.Optional(Type.Array(Type.String())),
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
