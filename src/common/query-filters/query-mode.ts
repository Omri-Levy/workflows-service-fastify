import { Type } from "@sinclair/typebox";

export const QueryMode = Type.Union([
  Type.Literal('default'),
  Type.Literal('insensitive'),
]);