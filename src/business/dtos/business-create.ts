import { Type } from "@sinclair/typebox";

export const BusinessCreateDto = Type.Object({
  companyName: Type.String(),
  registrationNumber: Type.String()
});