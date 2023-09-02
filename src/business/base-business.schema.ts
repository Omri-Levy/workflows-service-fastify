import { TypeDateString, TypeNullable } from "@/common/schemas/schemas";
import { ApprovalStateSchema } from "@/common/schemas/approval-state.schema";
import { Type } from "@sinclair/typebox";

export const BaseBusinessSchema = Type.Object({
  id: Type.String(),
  correlationId: Type.Optional(
    TypeNullable(Type.String())
  ),
  createdAt: TypeDateString,
  updatedAt: TypeDateString,
  companyName: Type.String(),
  registrationNumber: Type.Optional(
    TypeNullable(Type.String())
  ),
  legalForm: Type.Optional(
    TypeNullable(Type.String())
  ),
  country: Type.Optional(
    TypeNullable(Type.String())
  ),
  countryOfIncorporation: Type.Optional(
    TypeNullable(Type.String())
  ),
  dateOfIncorporation: Type.Optional(
    TypeNullable(
      TypeDateString
    )
  ),
  address: Type.Optional(Type.Any()),
  phoneNumber: Type.Optional(
    TypeNullable(Type.String())
  ),
  email: Type.Optional(
    TypeNullable(Type.String({ format: "email" }))
  ),
  website: Type.Optional(
    TypeNullable(Type.String())
  ),
  industry: Type.Optional(
    TypeNullable(Type.String())
  ),
  taxIdentificationNumber: Type.Optional(
    TypeNullable(Type.String())
  ),
  vatNumber: Type.Optional(
    TypeNullable(Type.String())
  ),
  shareholderStructure: Type.Optional(Type.Any()),
  numberOfEmployees: Type.Optional(
    TypeNullable(Type.Number())
  ),
  businessPurpose: Type.Optional(
    TypeNullable(Type.String())
  ),
  documents: Type.Optional(Type.Any()),
  avatarUrl: Type.Optional(
    TypeNullable(Type.String())
  ),
  additionalInfo: Type.Optional(Type.Any()),
  bankInformation: Type.Optional(Type.Any()),
  approvalState: ApprovalStateSchema,
  businessType: Type.String({
    default: "default"
  })
});