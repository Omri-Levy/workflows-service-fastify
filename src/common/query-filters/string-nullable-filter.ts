import { QueryMode } from './query-mode';
import { Type } from '@sinclair/typebox';

export const StringNullableFilter = Type.Object({
  equals: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  in: Type.Optional(Type.Union([Type.Array(Type.String()), Type.Null()])),
  notIn: Type.Optional(Type.Union([Type.Array(Type.String()), Type.Null()])),
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