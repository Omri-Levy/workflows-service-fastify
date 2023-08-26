import { Type } from "@sinclair/typebox";

export const ApprovalState = {
  PROCESSING: "PROCESSING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  NEW: "NEW",
} as const;

export const ApprovalStateSchema = Type.Enum(ApprovalState);

export const ApprovalStates = [
  ApprovalState.PROCESSING,
  ApprovalState.APPROVED,
  ApprovalState.REJECTED,
  ApprovalState.NEW,
] as const;

export type TApprovalState = typeof ApprovalStates[number];