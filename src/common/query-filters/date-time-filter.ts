import { Type } from "@sinclair/typebox";

export const DateTimeFilter = Type.Object({
  equals: Type.Optional(Type.String({ format: "date-time" })),
  not: Type.Optional(Type.String({ format: "date-time" })),
  in: Type.Optional(Type.Array(Type.String({ format: "date-time" }))),
  notIn: Type.Optional(Type.Array(Type.String({ format: "date-time" }))),
  lt: Type.Optional(Type.String({ format: "date-time" })),
  lte: Type.Optional(Type.String({ format: "date-time" })),
  gt: Type.Optional(Type.String({ format: "date-time" })),
  gte: Type.Optional(Type.String({ format: "date-time" }))
});