import {
  IntFilterSchema,
  zDateTimeFilterDateStringUnion,
  zStringFilterStringUnion,
  zStringNullableFilterStringNullUnion
} from "@/filter/dtos/filters-util-schemas";
import { z } from "zod";

export const BaseWorkflowDefinitionWhereInput = z.object({
  id: zStringFilterStringUnion,
  reviewMachineId: zStringNullableFilterStringNullUnion,
  name: zStringFilterStringUnion,
  version: z.union([IntFilterSchema, z.number()]),
  definitionType: zStringFilterStringUnion,
  definition: z.unknown(),
  supportedPlatforms: z.unknown(),
  extensions: z.unknown(),
  backend: z.unknown(),
  persistStates: z.unknown(),
  submitStates: z.unknown(),
  createdAt: zDateTimeFilterDateStringUnion,
  updatedAt: zDateTimeFilterDateStringUnion,
  createdBy: zStringFilterStringUnion,
}).partial();

export const BaseWorkflowDefinitionWhereInputSchema = z.object({
  id: zStringFilterStringUnion,
  reviewMachineId: zStringNullableFilterStringNullUnion,
  name: zStringFilterStringUnion,
  version: IntFilterSchema,
  definitionType: zStringFilterStringUnion,
  definition: z.unknown(),
  supportedPlatforms: z.unknown(),
  extensions: z.unknown(),
  backend: z.unknown(),
  persistStates: z.unknown(),
  submitStates: z.unknown(),
  createdAt: zDateTimeFilterDateStringUnion,
  updatedAt: zDateTimeFilterDateStringUnion,
  createdBy: zStringFilterStringUnion,
}).partial();

export const BaseWorkflowDefinitionSelectSchema = z.object({
  id: z.boolean(),
  reviewMachineId: z.boolean(),
  name: z.boolean(),
  config: z.boolean(),
  contextSchema: z.boolean(),
  version: z.boolean(),
  definitionType: z.boolean(),
  definition: z.boolean(),
  supportedPlatforms: z.boolean(),
  extensions: z.boolean(),
  backend: z.boolean(),
  persistStates: z.boolean(),
  submitStates: z.boolean(),
  createdAt: z.boolean(),
  updatedAt: z.boolean(),
  createdBy: z.boolean(),
}).partial();

