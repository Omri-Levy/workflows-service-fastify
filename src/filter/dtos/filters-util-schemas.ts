import { z, ZodSchema } from "zod";

export const zQueryModeEnum = z.enum(["Default", "Insensitive"]);

export const zApprovalStateEnum = z.enum(["APPROVED", "REJECTED", "PROCESSING", "NEW"]);

export const zEnumerable = <TSchema>(schema: ZodSchema<TSchema>) =>
  z.union([schema, schema.array()]);

export const BaseNestedIntFilterSchema = z.object({
  equals: z.number(),
  in: zEnumerable(z.number()),
  notIn: zEnumerable(z.number()),
  lt: z.number(),
  lte: z.number(),
  gt: z.number(),
  gte: z.number()
}).partial();

export const StringFilterSchema = z.object({
  equals: z.string(),
  in: z.array(z.string()),
  notIn: z.array(z.string()),
  lt: z.string(),
  lte: z.string(),
  gt: z.string(),
  gte: z.string(),
  contains: z.string(),
  startsWith: z.string(),
  endsWith: z.string(),
  mode: zQueryModeEnum,
  not: z.string()
}).partial();

export const DateTimeFilterSchema = z.object({
  equals: z.date(),
  in: z.array(z.date()),
  notIn: z.array(z.date()),
  lt: z.date(),
  lte: z.date(),
  gt: z.date(),
  gte: z.date(),
  not: z.date()
}).partial();

export const zStringFilterStringUnion = z.union([StringFilterSchema.strict(), z.string()]);

export const zDateTimeFilterDateStringUnion = z.union([
  DateTimeFilterSchema.strict(),
  z.date(),
  z.string()
]);

export const StringNullableFilterSchema = z.object({
  equals: z.string().nullable(),
  in: z.array(z.string()).nullable(),
  notIn: z.array(z.string()).nullable(),
  lt: z.string(),
  lte: z.string(),
  gt: z.string(),
  gte: z.string(),
  contains: z.string(),
  startsWith: z.string(),
  endsWith: z.string(),
  mode: zQueryModeEnum,
  not: z.string().nullable()
}).partial();

export const DateTimeNullableFilterSchema = z.object({
  equals: z.date().nullable(),
  in: z.array(z.date()).nullable(),
  notIn: z.array(z.date()).nullable(),
  not: z.date(),
  lt: z.date(),
  lte: z.date(),
  gt: z.date(),
  gte: z.date()
}).partial();

export const zStringNullableFilterStringNullUnion = z.union([
  StringNullableFilterSchema.strict(),
  z.string(),
  z.null()
]);

export const zDateTimeNullableFilterDateStringUnion = z.union([
  DateTimeNullableFilterSchema.strict(),
  z.date(),
  z.string(),
  z.null()
]);

export const BaseNestedIntNullableFilterSchema = z.object({
  equals: z.number().nullable(),
  in: zEnumerable(z.number()).nullable(),
  notIn: zEnumerable(z.number()).nullable(),
  lt: z.number(),
  lte: z.number(),
  gt: z.number(),
  gte: z.number()
}).partial();

export const NestedIntFilterSchema = BaseNestedIntFilterSchema.extend({
  not: z.union([BaseNestedIntFilterSchema, z.number()]).optional()
});

export const IntFilterSchema = z.object({
  equals: z.number(),
  in: z.array(z.number()),
  notIn: z.array(z.number()),
  lt: z.number(),
  lte: z.number(),
  gt: z.number(),
  gte: z.number(),
  not: z.union([NestedIntFilterSchema, z.number()])
}).partial();

export const BaseNestedEnumApprovalStateFilter = z.object({
  equals: zApprovalStateEnum.optional(),
  in: zEnumerable(zApprovalStateEnum).optional(),
  notIn: zEnumerable(zApprovalStateEnum).optional()
});

export const NestedEnumApprovalStateFilter = BaseNestedEnumApprovalStateFilter.extend({
  not: z.union([BaseNestedEnumApprovalStateFilter, zApprovalStateEnum]).optional()
});

export const NestedIntNullableFilterSchema = BaseNestedIntNullableFilterSchema.extend({
  not: z.union([BaseNestedIntNullableFilterSchema, z.number(), z.null()]).optional().nullable()
}).strict();

export const IntNullableFilterSchema = z.object({
  equals: z.number().nullable(),
  in: zEnumerable(z.number()).nullable(),
  notIn: zEnumerable(z.number()).nullable(),
  lt: z.number(),
  lte: z.number(),
  gt: z.number(),
  gte: z.number(),
  not: z.union([NestedIntNullableFilterSchema, z.number(), z.null()]).nullable()
}).partial().strict();