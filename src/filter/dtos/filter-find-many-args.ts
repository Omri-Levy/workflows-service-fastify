import { Type } from "@sinclair/typebox";
import { FilterWhereInput } from "./filter-where-input";

export const FilterFindManyArgs = Type.Object({
  where: Type.Optional(FilterWhereInput),
});
