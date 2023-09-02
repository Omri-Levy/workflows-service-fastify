import { TypeDateString } from "@/common/schemas/schemas";
import { Type } from "@sinclair/typebox";

export const FilterSchema = Type.Recursive((This) => Type.Object({
  id: Type.String(),
  name: Type.String(),
  entity: Type.String(),
  query: Type.Any(),
  createdAt: TypeDateString,
  updatedAt: TypeDateString,
  createdBy: Type.String(),
  sortOrder: Type.Optional(Type.Number()),
  parentFilterId: Type.Optional(Type.String()),
  parentFilter: Type.Optional(This)
}));