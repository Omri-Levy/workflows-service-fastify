import { Type } from "@sinclair/typebox";
import { EndUserWhereInput } from "./end-user-where-input";
import { EndUserOrderByInput } from "./end-user-order-by-input";

export const EndUserFindManyArgs = Type.Object({
  where: Type.Optional(EndUserWhereInput),
  orderBy: Type.Optional(Type.Array(EndUserOrderByInput)),
  skip: Type.Optional(Type.Number()),
  take: Type.Optional(Type.Number())
});

