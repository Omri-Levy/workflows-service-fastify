import { Type } from "@sinclair/typebox";

export const EndUserCreateDto = Type.Object({
  firstName: Type.String(),
  lastName: Type.String(),
});