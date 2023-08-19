import { Type } from "@sinclair/typebox";
import { createJsonValue } from "@/common/validation";

export const EndUserModel = Type.Object({
  id: Type.String(),
  isContactPerson: Type.Boolean(),
  correlationId: Type.Union([Type.String(), Type.Null()]),
  endUserType: Type.Union([Type.String(), Type.Null()]),
  approvalState: Type.String(),
  stateReason: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  firstName: Type.String(),
  lastName: Type.String(),
  email: Type.Union([Type.String({ format: "email" }), Type.Null()]),
  phone: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  country: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  dateOfBirth: Type.Union([
    Type.String({
      format: "date-time"
    }),
    Type.Null()
  ]),
  avatarUrl: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  nationalId: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  // @ts-ignore - Possibly infinite type
  additionalInfo: Type.Optional(createJsonValue("EndUserAdditionalInfo")),
  createdAt: Type.String({
    format: "date-time"
  }),
  updatedAt: Type.String({
    format: "date-time"
  })
});