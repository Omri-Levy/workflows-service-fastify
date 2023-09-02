import { TypeDateString, TypeNullable } from "@/common/schemas/schemas";
import { ApprovalStateSchema } from "@/common/schemas/approval-state.schema";
import { Type } from "@sinclair/typebox";

export const BaseEndUserSchema = Type.Object({
  id: Type.String(),
  isContactPerson: Type.Boolean({ default: false }),
  correlationId: Type.Optional(
    TypeNullable(Type.String())
  ),
  endUserType: Type.Optional(
    TypeNullable(Type.String())
  ),
  approvalState: ApprovalStateSchema,
  stateReason: Type.Optional(
    TypeNullable(Type.String())
  ),
  firstName: Type.String(),
  lastName: Type.String(),
  email: Type.Optional(
    TypeNullable(Type.String({ format: "email" }))
  ),
  phone: Type.Optional(
    TypeNullable(Type.String())
  ),
  country: Type.Optional(
    TypeNullable(Type.String())
  ),
  dateOfBirth: Type.Optional(
    TypeNullable(
      TypeDateString
    )
  ),
  avatarUrl: Type.Optional(
    TypeNullable(Type.String())
  ),
  nationalId: Type.Optional(
    TypeNullable(Type.String())
  ),
  additionalInfo: Type.Optional(Type.Any()),
  createdAt: TypeDateString,
  updatedAt: TypeDateString
});