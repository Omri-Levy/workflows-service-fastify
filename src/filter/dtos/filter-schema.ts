/**
 * Before getting rid of this file we need to;
 * 1. Generate Zod schemas from json-schema or Prisma
 * 2. Generate Swagger docs from json-schema or Zod schemas
 * 3. Replace instances of class-validator and class-transformer with Zod
 */

import { z } from "zod";
import { zDateTimeFilterDateStringUnion } from "@/filter/dtos/filters-util-schemas";

export const FilterSchema = z.object({
  id: z.string().cuid(),
  name: z.string(),
  entity: z.string(),
  createdBy: z.string().default("SYSTEM"),
  createdAt: zDateTimeFilterDateStringUnion,
  updatedAt: zDateTimeFilterDateStringUnion
});

