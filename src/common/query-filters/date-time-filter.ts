import { Type } from "@sinclair/typebox";

export const DateTimeFilter = Type.Object({
  equals: Type.Optional(Type.Unsafe<Date>({ type: "string", format: "date-time" })),
  not: Type.Optional(Type.Unsafe<Date>({ type: "string", format: "date-time" })),
  in: Type.Optional(Type.Array(Type.Unsafe<Date>({ type: "string", format: "date-time" }))),
  notIn: Type.Optional(Type.Array(Type.Unsafe<Date>({ type: "string", format: "date-time" }))),
  lt: Type.Optional(Type.Unsafe<Date>({ type: "string", format: "date-time" })),
  lte: Type.Optional(Type.Unsafe<Date>({ type: "string", format: "date-time" })),
  gt: Type.Optional(Type.Unsafe<Date>({ type: "string", format: "date-time" })),
  gte: Type.Optional(Type.Unsafe<Date>({ type: "string", format: "date-time" }))
});