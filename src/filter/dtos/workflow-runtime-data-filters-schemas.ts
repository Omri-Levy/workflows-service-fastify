import {
  zDateTimeFilterDateStringUnion,
  zStringFilterStringUnion,
  zStringNullableFilterStringNullUnion
} from "@/filter/dtos/filters-util-schemas";
import { z } from "zod";

export const BaseWorkflowRuntimeDataWhereInputSchema = z.object({
  id: zStringFilterStringUnion,
  endUserId: zStringNullableFilterStringNullUnion,
  businessId: zStringNullableFilterStringNullUnion,
  workflowDefinitionId: zStringFilterStringUnion,
  workflowDefinitionVersion: zStringFilterStringUnion,
  context: z.unknown(),
  assigneeId: zStringNullableFilterStringNullUnion,
  config: z.unknown(),
  state: zStringNullableFilterStringNullUnion,
  status: zStringFilterStringUnion,
  createdAt: zDateTimeFilterDateStringUnion,
  updatedAt: zDateTimeFilterDateStringUnion,
  createdBy: zStringFilterStringUnion
}).partial().strict();

export const BaseWorkflowRuntimeDataSelectSchema = z.object({
  id: z.boolean(),
  endUserId: z.boolean(),
  businessId: z.boolean(),
  assigneeId: z.boolean(),
  workflowDefinitionId: z.boolean(),
  workflowDefinitionVersion: z.boolean(),
  context: z.boolean(),
  state: z.boolean(),
  status: z.boolean(),
  createdAt: z.boolean(),
  updatedAt: z.boolean(),
  createdBy: z.boolean(),
  resolvedAt: z.boolean()
}).partial();

