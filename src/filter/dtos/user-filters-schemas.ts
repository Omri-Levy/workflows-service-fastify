import { zDateTimeFilterDateStringUnion, zStringFilterStringUnion } from "@/filter/dtos/filters-util-schemas";
import { z } from "zod";

export const BaseUserSelectSchema = z.object({
  id: z.boolean(),
  firstName: z.boolean(),
  lastName: z.boolean(),
  email: z.boolean(),
  phone: z.boolean(),
  roles: z.boolean(),
  createdAt: z.boolean(),
  updatedAt: z.boolean(),
}).partial();

export const BaseUserWhereInputSchema = z.object({
  id: zStringFilterStringUnion,
  firstName: zStringFilterStringUnion,
  lastName: zStringFilterStringUnion,
  email: zStringFilterStringUnion,
  phone: zStringFilterStringUnion,
  roles: zStringFilterStringUnion,
  createdAt: zDateTimeFilterDateStringUnion,
  updatedAt: zDateTimeFilterDateStringUnion,
}).partial();

