import { Type } from "@sinclair/typebox";
import { TypeDateString } from "@/common/schemas/schemas";

export const EntitiesSchema = Type.Object({
  id: Type.String(),
  firstName: Type.String(),
  lastName: Type.String(),
  email: Type.String({
    format: "email"
  }),
  phone: Type.Optional(Type.String()),
  password: Type.String(),
  roles: Type.Any(),
  createdAt: TypeDateString,
  updatedAt: TypeDateString
});

