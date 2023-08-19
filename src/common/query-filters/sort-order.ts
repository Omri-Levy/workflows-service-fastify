import { Type } from "@sinclair/typebox";

export const SortOrder = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export const SortOrders = [
  SortOrder.ASC,
  SortOrder.DESC,
] as const;

export type TSortOrder = typeof SortOrders[number];

export const SortOrderSchema = Type.Union([
  Type.Literal('asc'),
  Type.Literal('desc')
]);
