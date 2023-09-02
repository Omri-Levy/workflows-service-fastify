import { Type } from "@sinclair/typebox";

export const ApprovalStateSchema = Type.Union([
  Type.Literal("APPROVED"),
  Type.Literal("REJECTED"),
  Type.Literal("PROCESSING"),
  Type.Literal("NEW")
]);