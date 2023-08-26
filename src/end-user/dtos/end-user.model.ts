import { Type } from "@sinclair/typebox";
import { createJsonValue, TypeNullable } from "@/common/validation";

export const EndUserModel = Type.Object({
  id: Type.String(),
  isContactPerson: Type.Boolean(),
  correlationId: TypeNullable(Type.String()),
  endUserType: TypeNullable(Type.String()),
  approvalState: Type.String(),
  stateReason: Type.Optional(TypeNullable(Type.String())),
  firstName: Type.String(),
  lastName: Type.String(),
  email: TypeNullable(Type.String({ format: "email" })),
  phone: Type.Optional(TypeNullable(Type.String())),
  country: Type.Optional(TypeNullable(Type.String())),
  dateOfBirth: TypeNullable(
    Type.Unsafe<Date>({ type: "string", format: "date-time" })
  ),
  avatarUrl: Type.Optional(TypeNullable(Type.String())),
  nationalId: Type.Optional(TypeNullable(Type.String())),
  // @ts-ignore - Possibly infinite type
  additionalInfo: Type.Optional(createJsonValue("EndUserAdditionalInfo")),
  createdAt: Type.Unsafe<Date>({ type: "string", format: "date-time" }),
  updatedAt: Type.Unsafe<Date>({ type: "string", format: "date-time" })
});