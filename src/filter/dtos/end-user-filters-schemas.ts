// @ts-ignore
import {
  NestedEnumApprovalStateFilter,
  zApprovalStateEnum, zDateTimeFilterDateStringUnion, zDateTimeNullableFilterDateStringUnion, zStringFilterStringUnion,
  zStringNullableFilterStringNullUnion
} from "@/filter/dtos/filters-util-schemas";
import { z } from "zod";

export const BaseEndUserWhereInputSchema = z.object({
  id: zStringFilterStringUnion,
  correlationId: zStringFilterStringUnion,
  verificationId: zStringNullableFilterStringNullUnion,
  endUserType: zStringNullableFilterStringNullUnion,
  approvalState: z.union([NestedEnumApprovalStateFilter, zApprovalStateEnum]),
  stateReason: zStringNullableFilterStringNullUnion,
  firstName: zStringNullableFilterStringNullUnion,
  lastName: zStringNullableFilterStringNullUnion,
  email: zStringNullableFilterStringNullUnion,
  phone: zStringNullableFilterStringNullUnion,
  dateOfBirth: zDateTimeNullableFilterDateStringUnion,
  avatarUrl: zStringNullableFilterStringNullUnion,
  createdAt: zDateTimeFilterDateStringUnion,
  updatedAt: zDateTimeFilterDateStringUnion,
}).partial();

export const BaseEndUserSelectSchema = z.object({
  id: z.boolean(),
  correlationId: z.boolean(),
  verificationId: z.boolean(),
  endUserType: z.boolean(),
  approvalState: z.boolean(),
  stateReason: z.boolean(),
  jsonData: z.boolean(),
  firstName: z.boolean(),
  lastName: z.boolean(),
  email: z.boolean(),
  phone: z.boolean(),
  dateOfBirth: z.boolean(),
  avatarUrl: z.boolean(),
  additionalInfo: z.boolean(),
  createdAt: z.boolean(),
  updatedAt: z.boolean(),
}).partial();