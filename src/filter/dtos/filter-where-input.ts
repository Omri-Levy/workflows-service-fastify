import { Type } from "@sinclair/typebox";
import { StringFilter } from "@/common/query-filters/string-filter";

export const FilterWhereInput = Type.Object({
  name: Type.Optional(StringFilter),
  entity: Type.Optional(StringFilter)
});
