import { Type } from "@sinclair/typebox";

export const UserCreateDto = Type.Object({
  email: Type.String(),
  firstName: Type.String(),
  lastName: Type.String(),
  password: Type.String(),
  roles: Type.Array(Type.String())
});

