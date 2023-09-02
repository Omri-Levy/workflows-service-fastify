import { Type } from "@sinclair/typebox";
import { TypeDateString } from "@/common/schemas/schemas";

export const DateTimeFilter = Type.Object({
  equals: Type.Optional(TypeDateString),
  not: Type.Optional(TypeDateString),
  in: Type.Optional(Type.Array(TypeDateString)),
  notIn: Type.Optional(Type.Array(TypeDateString)),
  lt: Type.Optional(TypeDateString),
  lte: Type.Optional(TypeDateString),
  gt: Type.Optional(TypeDateString),
  gte: Type.Optional(TypeDateString)
});