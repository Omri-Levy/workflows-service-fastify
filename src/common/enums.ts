import { Type } from "@sinclair/typebox";

export const ApprovalState = {
  PROCESSING: "PROCESSING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export const ApprovalStateEnum = Type.Enum(ApprovalState);