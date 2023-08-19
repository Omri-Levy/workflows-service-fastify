import { SortOrderSchema } from "@/common/query-filters/sort-order";
import { Type } from "@sinclair/typebox";

export const EndUserOrderByInput = Type.Object({
  id: Type.Optional(SortOrderSchema),
  definitionType: Type.Optional(SortOrderSchema),
  name: Type.Optional(SortOrderSchema),
  createdAt: Type.Optional(SortOrderSchema),
  updatedAt: Type.Optional(SortOrderSchema)
});

