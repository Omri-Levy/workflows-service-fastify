import { TypeDateString, TypeNullable } from "@/common/schemas/schemas";
import { Type } from "@sinclair/typebox";

export const BaseUserSchema = Type.Object({
  id: Type.String(),
  firstName: Type.String(),
  lastName: Type.String(),
  email: Type.String(),
  phone: Type.Optional(
    TypeNullable(Type.String())
  ),
  password: Type.String(),
  roles: Type.Any(),
  createdAt: TypeDateString,
  updatedAt: TypeDateString,
  lastActiveAt: Type.Optional(TypeDateString)
});